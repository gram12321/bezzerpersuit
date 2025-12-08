import { useState, useEffect, useCallback } from 'react'
import type { Question, Player, LobbyState, GamePhase, QuestionCategory, DifficultyScore } from '@/lib/utils/types'
import { fetchRandomQuestions, updateQuestionStatsFromPlayers } from '@/lib/services'
import { 
  haveAllPlayersAnswered, 
  getNextTurnPlayerIndex, 
  isLastQuestion, 
  autoSubmitUnansweredPlayers,
  resetPlayerAnswers,
  updatePlayerAnswer,
  markPlayerCategoryUsed,
  markPlayerDifficultyUsed,
  areAllCategoriesUsed,
  areAllDifficultiesUsed,
  resetPlayerCategories,
  resetPlayerDifficulties
} from '@/lib/services/gameService'
import { applyScores, isAnswerCorrect } from '@/lib/services/scoringService'
import { selectAICategory, selectAIDifficulty, generateAIAnswers } from '@/lib/ai/aiLogic'
import { QUESTIONS_PER_GAME, QUESTION_TIME_LIMIT, SELECTION_TIME_LIMIT, I_KNOW_POWERUPS_PER_PLAYER } from '@/lib/constants'

export interface GameState {
  currentQuestionIndex: number
  score: number
  timeRemaining: number
  selectionTimeRemaining: number
  isGameActive: boolean
  isLoading: boolean
  error: string | null
  selectedAnswer: number | null
  showResult: boolean
  isCorrect: boolean
  questions: Question[]
  players: Player[]
  currentPlayerId: string
  gamePhase: GamePhase
  currentTurnPlayerIndex: number
  selectedCategory: QuestionCategory | null
  selectedDifficulty: DifficultyScore | null
  currentSelectionCategory: QuestionCategory | null
  currentSelectionDifficulty: DifficultyScore | null
}

export function useGameState(initialLobby?: LobbyState) {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    timeRemaining: initialLobby?.gameOptions.questionTimeLimit || QUESTION_TIME_LIMIT,
    selectionTimeRemaining: initialLobby?.gameOptions.selectionTimeLimit || SELECTION_TIME_LIMIT,
    isGameActive: false,
    isLoading: false,
    error: null,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    questions: [],
    players: (initialLobby?.players || []).map(p => ({
      ...p,
      usedCategories: p.usedCategories || [],
      usedDifficulties: p.usedDifficulties || []
    })),
    currentPlayerId: initialLobby?.players.find(p => !p.isAI)?.id || '',
    gamePhase: 'category-selection',
    currentTurnPlayerIndex: 0,
    selectedCategory: null,
    selectedDifficulty: null,
    currentSelectionCategory: null,
    currentSelectionDifficulty: null
  })

  const startGame = useCallback(async (lobby?: LobbyState) => {
    setGameState(prev => {
      const players = lobby?.players || prev.players
      const currentPlayerId = lobby?.players.find(p => !p.isAI)?.id || prev.currentPlayerId
      const questionTimeLimit = lobby?.gameOptions.questionTimeLimit || QUESTION_TIME_LIMIT
      const selectionTimeLimit = lobby?.gameOptions.selectionTimeLimit || SELECTION_TIME_LIMIT
      const iKnowPowerups = lobby?.gameOptions.iKnowPowerupsPerPlayer ?? I_KNOW_POWERUPS_PER_PLAYER
      
      return {
        currentQuestionIndex: 0,
        score: 0,
        timeRemaining: questionTimeLimit,
        selectionTimeRemaining: selectionTimeLimit,
        isGameActive: true,
        isLoading: false,
        error: null,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false,
        questions: [],
        players: players.map(p => ({ 
          ...p, 
          hasAnswered: false, 
          selectedAnswer: undefined,
          iKnowPowerupsRemaining: iKnowPowerups,
          usedIKnowThisRound: false,
          usedCategories: [],
          usedDifficulties: []
        })),
        currentPlayerId,
        gamePhase: 'category-selection' as GamePhase,
        currentTurnPlayerIndex: 0,
        selectedCategory: null,
        selectedDifficulty: null,
        currentSelectionCategory: null,
        currentSelectionDifficulty: null
      }
    })
  }, [])

  // Selection timer countdown
  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'category-selection') return

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.selectionTimeRemaining <= 1) {
          // Time's up - auto-select randomly using AI logic
          const currentPlayer = prev.players[prev.currentTurnPlayerIndex]
          const randomCategory = selectAICategory(currentPlayer.usedCategories || [])
          const randomDifficulty = selectAIDifficulty(currentPlayer.usedDifficulties || [])
          
          return {
            ...prev,
            selectionTimeRemaining: 0,
            selectedCategory: randomCategory,
            selectedDifficulty: randomDifficulty
          }
        }
        return { ...prev, selectionTimeRemaining: prev.selectionTimeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isGameActive, gameState.gamePhase])

  // AI auto-selects category when it's their turn (with delay for visibility)
  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'category-selection') return
    
    const currentTurnPlayer = gameState.players[gameState.currentTurnPlayerIndex]
    if (!currentTurnPlayer?.isAI) {
      console.log('👤 Current turn player is human:', currentTurnPlayer?.name)
      return
    }

    // Don't run if selections are already made or if we're loading
    if (gameState.selectedCategory || gameState.selectedDifficulty || gameState.isLoading) {
      console.log('🤖 Skipping AI selection - already in progress or loading')
      return
    }

    console.log('🤖 AI turn player:', currentTurnPlayer.name)
    const aiCategory = selectAICategory(currentTurnPlayer.usedCategories || [])
    const aiDifficulty = selectAIDifficulty(currentTurnPlayer.usedDifficulties || [])
    console.log('🤖 AI selected:', { category: aiCategory, difficulty: aiDifficulty })
    
    // Show category selection first
    setTimeout(() => {
      console.log('🤖 Setting currentSelectionCategory:', aiCategory)
      setGameState(prev => ({ 
        ...prev, 
        currentSelectionCategory: aiCategory
      }))
      
      // Show difficulty selection after another delay
      setTimeout(() => {
        console.log('🤖 Setting currentSelectionDifficulty:', aiDifficulty)
        setGameState(prev => ({ 
          ...prev, 
          currentSelectionDifficulty: aiDifficulty
        }))
        
        // Finalize both selections after brief pause
        setTimeout(() => {
          console.log('🤖 Finalizing selections:', { category: aiCategory, difficulty: aiDifficulty })
          setGameState(prev => ({ 
            ...prev, 
            selectedCategory: aiCategory,
            selectedDifficulty: aiDifficulty
          }))
        }, 800)
      }, 1500)
    }, 1000)
  }, [gameState.isGameActive, gameState.gamePhase, gameState.currentTurnPlayerIndex])

  // Load question when both category and difficulty are selected
  useEffect(() => {
    console.log('📋 Question loading effect triggered:', {
      isGameActive: gameState.isGameActive,
      gamePhase: gameState.gamePhase,
      selectedCategory: gameState.selectedCategory,
      selectedDifficulty: gameState.selectedDifficulty,
      isLoading: gameState.isLoading
    })

    if (!gameState.isGameActive || gameState.gamePhase !== 'category-selection') {
      console.log('❌ Skipping: Wrong phase or game not active')
      return
    }
    
    if (!gameState.selectedCategory || !gameState.selectedDifficulty) {
      console.log('❌ Skipping: Missing category or difficulty')
      return
    }

    if (gameState.isLoading) {
      console.log('❌ Skipping: Already loading')
      return
    }

    console.log('🔍 Loading question:', {
      category: gameState.selectedCategory,
      difficulty: gameState.selectedDifficulty,
      range: [gameState.selectedDifficulty - 0.1, gameState.selectedDifficulty + 0.1]
    })

    setGameState(prev => ({ ...prev, isLoading: true, error: null }))
    
    fetchRandomQuestions(1, gameState.selectedCategory!, gameState.selectedDifficulty! - 0.1, gameState.selectedDifficulty! + 0.1)
      .then(questions => {
        console.log('✅ Questions fetched:', questions.length)
        if (questions.length === 0) {
          throw new Error('No questions found')
        }

        setGameState(prev => {
          // Mark category and difficulty as used for the current turn player
          let updatedPlayers = markPlayerCategoryUsed(prev.players, prev.currentTurnPlayerIndex, prev.selectedCategory!)
          updatedPlayers = markPlayerDifficultyUsed(updatedPlayers, prev.currentTurnPlayerIndex, prev.selectedDifficulty!)
          updatedPlayers = resetPlayerAnswers(updatedPlayers)

          console.log('✅ Moving to answering phase')
          return {
            ...prev,
            isLoading: false,
            questions: [...prev.questions, questions[0]],
            gamePhase: 'answering' as GamePhase,
            timeRemaining: initialLobby?.gameOptions.questionTimeLimit || QUESTION_TIME_LIMIT,
            selectionTimeRemaining: initialLobby?.gameOptions.selectionTimeLimit || SELECTION_TIME_LIMIT,
            players: updatedPlayers,
            selectedCategory: null,
            selectedDifficulty: null,
            currentSelectionCategory: null,
            currentSelectionDifficulty: null
          }
        })
      })
      .catch(error => {
        console.error('❌ Failed to load question:', error)
        setGameState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load question. Please try again.'
        }))
      })
  }, [gameState.selectedCategory, gameState.selectedDifficulty, gameState.gamePhase, gameState.isGameActive, initialLobby])

  // AI players auto-answer immediately when question loads
  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'answering') return

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
    if (!currentQuestion) return

    setGameState(prev => ({
      ...prev,
      players: generateAIAnswers(prev.players, currentQuestion)
    }))
  }, [gameState.isGameActive, gameState.gamePhase, gameState.currentQuestionIndex])

  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'answering') return

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          const currentQuestion = prev.questions[prev.currentQuestionIndex]
          
          // Auto-submit for players who haven't answered
          const finalPlayers = autoSubmitUnansweredPlayers(prev.players)

          // Calculate scores using service
          const scoredPlayers = applyScores(
            finalPlayers,
            prev.currentTurnPlayerIndex,
            currentQuestion
          )

          const turnPlayerAnswer = finalPlayers[prev.currentTurnPlayerIndex].selectedAnswer!
          const turnPlayerCorrect = isAnswerCorrect(turnPlayerAnswer, currentQuestion)

          return {
            ...prev,
            timeRemaining: 0,
            selectedAnswer: finalPlayers.find(p => p.id === prev.currentPlayerId)?.selectedAnswer ?? 0,
            showResult: true,
            isCorrect: turnPlayerCorrect,
            players: scoredPlayers,
            gamePhase: 'results' as GamePhase
          }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isGameActive, gameState.gamePhase, gameState.currentQuestionIndex])

  const submitAnswer = useCallback((answerIndex: number, playerId: string) => {
    setGameState(prev => {
      const currentQuestion = prev.questions[prev.currentQuestionIndex]
      const correct = isAnswerCorrect(answerIndex, currentQuestion)
      const isAnsweringPlayer = playerId === prev.currentPlayerId

      // Update player's answer using service
      const updatedPlayers = updatePlayerAnswer(prev.players, playerId, answerIndex)

      // Check if all players have answered
      const allAnswered = haveAllPlayersAnswered(updatedPlayers)

      if (allAnswered) {
        // Calculate scores using service
        const scoredPlayers = applyScores(
          updatedPlayers,
          prev.currentTurnPlayerIndex,
          currentQuestion
        )

        // Update question stats (fire and forget - don't block UI)
        updateQuestionStatsFromPlayers(currentQuestion, scoredPlayers)
          .catch(error => {
            console.error('Failed to update question stats:', error)
          })

        return {
          ...prev,
          selectedAnswer: answerIndex,
          showResult: true,
          isCorrect: isAnsweringPlayer ? correct : false,
          score: isAnsweringPlayer && correct ? prev.score + 1 : prev.score,
          players: scoredPlayers,
          gamePhase: 'results' as GamePhase
        }
      }

      // If not all answered yet, just update the player
      return {
        ...prev,
        players: updatedPlayers
      }
    })
  }, [])

  const nextQuestion = useCallback(() => {
    setGameState(prev => {
      const questionsPerGame = initialLobby?.gameOptions.questionsPerGame || QUESTIONS_PER_GAME
      if (isLastQuestion(prev.currentQuestionIndex, questionsPerGame)) {
        return {
          ...prev,
          isGameActive: false
        }
      }

      const nextTurnPlayerIndex = getNextTurnPlayerIndex(prev.currentTurnPlayerIndex, prev.players.length)
      const questionTimeLimit = initialLobby?.gameOptions.questionTimeLimit || QUESTION_TIME_LIMIT
      const selectionTimeLimit = initialLobby?.gameOptions.selectionTimeLimit || SELECTION_TIME_LIMIT

      console.log('🔄 Turn rotation:', {
        currentIndex: prev.currentTurnPlayerIndex,
        currentPlayer: prev.players[prev.currentTurnPlayerIndex]?.name,
        nextIndex: nextTurnPlayerIndex,
        nextPlayer: prev.players[nextTurnPlayerIndex]?.name,
        totalPlayers: prev.players.length
      })

      // Check if next turn player needs their categories or difficulties reset
      const nextPlayer = prev.players[nextTurnPlayerIndex]
      let updatedPlayers = prev.players
      
      if (areAllCategoriesUsed(nextPlayer.usedCategories || [])) {
        updatedPlayers = resetPlayerCategories(updatedPlayers, nextTurnPlayerIndex)
      }

      if (areAllDifficultiesUsed(nextPlayer.usedDifficulties || [])) {
        updatedPlayers = resetPlayerDifficulties(updatedPlayers, nextTurnPlayerIndex)
      }
      
      updatedPlayers = resetPlayerAnswers(updatedPlayers).map(p => ({ ...p, usedIKnowThisRound: false }))

      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentTurnPlayerIndex: nextTurnPlayerIndex,
        gamePhase: 'category-selection' as GamePhase,
        timeRemaining: questionTimeLimit,
        selectionTimeRemaining: selectionTimeLimit,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false,
        selectedCategory: null,
        selectedDifficulty: null,
        players: updatedPlayers,
        currentSelectionCategory: null,
        currentSelectionDifficulty: null
      }
    })
  }, [initialLobby])

  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isGameActive: false
    }))
  }, [])

  const selectCategory = useCallback((category: QuestionCategory) => {
    setGameState(prev => ({ 
      ...prev, 
      selectedCategory: category,
      currentSelectionCategory: category
    }))
  }, [])

  const selectDifficulty = useCallback((difficulty: DifficultyScore) => {
    setGameState(prev => ({ 
      ...prev, 
      selectedDifficulty: difficulty,
      currentSelectionDifficulty: difficulty
    }))
  }, [])

  const getCurrentTurnPlayer = useCallback(() => {
    return gameState.players[gameState.currentTurnPlayerIndex]
  }, [gameState.players, gameState.currentTurnPlayerIndex])

  const useIKnow = useCallback((playerId: string) => {
    setGameState(prev => {
      const player = prev.players.find(p => p.id === playerId)
      
      // Validation checks
      if (!player || player.id === prev.players[prev.currentTurnPlayerIndex].id) {
        return prev // Can't use if you're the turn player
      }
      if ((player.iKnowPowerupsRemaining || 0) <= 0) {
        return prev // No powerups left
      }
      if (player.usedIKnowThisRound) {
        return prev // Already used this round
      }
      
      // Use the powerup
      return {
        ...prev,
        players: prev.players.map(p => 
          p.id === playerId 
            ? { 
                ...p, 
                usedIKnowThisRound: true,
                iKnowPowerupsRemaining: (p.iKnowPowerupsRemaining || 0) - 1
              }
            : p
        )
      }
    })
  }, [])

  return {
    gameState,
    startGame,
    submitAnswer,
    nextQuestion,
    endGame,
    selectCategory,
    selectDifficulty,
    getCurrentTurnPlayer,
    useIKnow
  }
}
