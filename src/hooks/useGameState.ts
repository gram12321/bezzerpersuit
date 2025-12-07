import { useState, useEffect, useCallback } from 'react'
import type { Question, Player, LobbyState, GamePhase, QuestionCategory, DifficultyScore } from '@/lib/utils/types'
import { QUIZ_CATEGORIES } from '@/lib/utils/types'
import { fetchRandomQuestions } from '@/lib/services'
import { QUESTIONS_PER_GAME, SELECTION_TIME_LIMIT } from '@/lib/constants'

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
}

export function useGameState(initialLobby?: LobbyState) {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    timeRemaining: 15,
    selectionTimeRemaining: SELECTION_TIME_LIMIT,
    isGameActive: false,
    isLoading: false,
    error: null,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    questions: [],
    players: initialLobby?.players || [],
    currentPlayerId: initialLobby?.players.find(p => !p.isAI)?.id || '',
    gamePhase: 'category-selection',
    currentTurnPlayerIndex: 0,
    selectedCategory: null,
    selectedDifficulty: null
  })

  const startGame = useCallback(async (lobby?: LobbyState) => {
    setGameState(prev => {
      const players = lobby?.players || prev.players
      const currentPlayerId = lobby?.players.find(p => !p.isAI)?.id || prev.currentPlayerId
      
      return {
        currentQuestionIndex: 0,
        score: 0,
        timeRemaining: 15,
        selectionTimeRemaining: SELECTION_TIME_LIMIT,
        isGameActive: true,
        isLoading: false,
        error: null,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false,
        questions: [],
        players: players.map(p => ({ ...p, hasAnswered: false, selectedAnswer: undefined })),
        currentPlayerId,
        gamePhase: 'category-selection' as GamePhase,
        currentTurnPlayerIndex: 0,
        selectedCategory: null,
        selectedDifficulty: null
      }
    })
  }, [])

  // Selection timer countdown
  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'category-selection') return

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.selectionTimeRemaining <= 1) {
          // Time's up - auto-select randomly
          const randomCategory = QUIZ_CATEGORIES[Math.floor(Math.random() * QUIZ_CATEGORIES.length)]
          const randomDifficulty = 0.3 + Math.random() * 0.4
          
          // This will trigger the effect below to load the question
          return {
            ...prev,
            selectionTimeRemaining: 0,
            selectedCategory: randomCategory,
            selectedDifficulty: randomDifficulty as DifficultyScore
          }
        }
        return { ...prev, selectionTimeRemaining: prev.selectionTimeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isGameActive, gameState.gamePhase])

  // AI auto-selects category when it's their turn
  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'category-selection') return
    
    const currentTurnPlayer = gameState.players[gameState.currentTurnPlayerIndex]
    if (!currentTurnPlayer?.isAI) return

    const randomCategory = QUIZ_CATEGORIES[Math.floor(Math.random() * QUIZ_CATEGORIES.length)]
    const randomDifficulty = 0.3 + Math.random() * 0.4 // 0.3 to 0.7
    
    setGameState(prev => ({ 
      ...prev, 
      selectedCategory: randomCategory,
      selectedDifficulty: randomDifficulty as DifficultyScore
    }))
  }, [gameState.isGameActive, gameState.gamePhase, gameState.currentTurnPlayerIndex])

  // Load question when both category and difficulty are selected
  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'category-selection') return
    if (!gameState.selectedCategory || !gameState.selectedDifficulty) return

    setGameState(prev => ({ ...prev, isLoading: true, error: null }))
    
    fetchRandomQuestions(1, gameState.selectedCategory!, gameState.selectedDifficulty! - 0.1, gameState.selectedDifficulty! + 0.1)
      .then(questions => {
        if (questions.length === 0) {
          throw new Error('No questions found')
        }

        setGameState(prev => ({
          ...prev,
          isLoading: false,
          questions: [...prev.questions, questions[0]],
          gamePhase: 'answering' as GamePhase,
          timeRemaining: 15,
          selectionTimeRemaining: SELECTION_TIME_LIMIT,
          players: prev.players.map(p => ({ ...p, hasAnswered: false, selectedAnswer: undefined }))
        }))
      })
      .catch(error => {
        console.error('Failed to load question:', error)
        setGameState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load question. Please try again.'
        }))
      })
  }, [gameState.selectedCategory, gameState.selectedDifficulty, gameState.gamePhase, gameState.isGameActive])

  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'answering') return

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
    if (!currentQuestion) return

    // AI players auto-answer immediately
    setGameState(prev => {
      // Make AI players answer
      const updatedPlayers = prev.players.map(p => {
        if (p.isAI && !p.hasAnswered) {
          // AI answers based on difficulty
          const aiAnswer = Math.random() < (1 - currentQuestion.difficulty) 
            ? currentQuestion.correctAnswerIndex 
            : Math.floor(Math.random() * currentQuestion.answers.length)
          return { ...p, hasAnswered: true, selectedAnswer: aiAnswer }
        }
        return p
      })

      return { ...prev, players: updatedPlayers }
    })
  }, [gameState.isGameActive, gameState.gamePhase, gameState.currentQuestionIndex])

  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'answering') return

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          const currentQuestion = prev.questions[prev.currentQuestionIndex]
          
          // Auto-submit for players who haven't answered
          const finalPlayers = prev.players.map(p => {
            if (!p.hasAnswered) {
              return { ...p, hasAnswered: true, selectedAnswer: 0 }
            }
            return p
          })

          // Calculate scores
          const turnPlayerAnswer = finalPlayers[prev.currentTurnPlayerIndex].selectedAnswer!
          const turnPlayerCorrect = turnPlayerAnswer === currentQuestion.correctAnswerIndex

          const scoredPlayers = finalPlayers.map((p, index) => {
            if (index === prev.currentTurnPlayerIndex) {
              return { ...p, score: p.score + (turnPlayerCorrect ? 1 : 0) }
            } else {
              const playerCorrect = p.selectedAnswer === currentQuestion.correctAnswerIndex
              const earnedPoints = !turnPlayerCorrect && playerCorrect ? 1 : 0
              return { ...p, score: p.score + earnedPoints }
            }
          })

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
      const isCorrect = answerIndex === currentQuestion.correctAnswerIndex
      const isAnsweringPlayer = playerId === prev.currentPlayerId

      // Update player's answer
      const updatedPlayers = prev.players.map(p => {
        if (p.id === playerId) {
          return { ...p, hasAnswered: true, selectedAnswer: answerIndex }
        }
        return p
      })

      // Check if all players have answered
      const allAnswered = updatedPlayers.every(p => p.hasAnswered)

      if (allAnswered) {
        // Calculate scores based on turn-based rules
        const turnPlayerAnswer = updatedPlayers[prev.currentTurnPlayerIndex].selectedAnswer!
        const turnPlayerCorrect = turnPlayerAnswer === currentQuestion.correctAnswerIndex

        const scoredPlayers = updatedPlayers.map((p, index) => {
          if (index === prev.currentTurnPlayerIndex) {
            // Turn player always gets points if correct
            return { ...p, score: p.score + (turnPlayerCorrect ? 1 : 0) }
          } else {
            // Other players only get points if turn player was wrong AND they are correct
            const playerCorrect = p.selectedAnswer === currentQuestion.correctAnswerIndex
            const earnedPoints = !turnPlayerCorrect && playerCorrect ? 1 : 0
            return { ...p, score: p.score + earnedPoints }
          }
        })

        return {
          ...prev,
          selectedAnswer: answerIndex,
          showResult: true,
          isCorrect: isAnsweringPlayer ? isCorrect : false,
          score: isAnsweringPlayer && isCorrect ? prev.score + 1 : prev.score,
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
      const isLastQuestion = prev.currentQuestionIndex >= QUESTIONS_PER_GAME - 1
      
      if (isLastQuestion) {
        return {
          ...prev,
          isGameActive: false
        }
      }

      // Move to next turn player
      const nextTurnPlayerIndex = (prev.currentTurnPlayerIndex + 1) % prev.players.length

      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentTurnPlayerIndex: nextTurnPlayerIndex,
        gamePhase: 'category-selection' as GamePhase,
        timeRemaining: 15,
        selectionTimeRemaining: SELECTION_TIME_LIMIT,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false,
        selectedCategory: null,
        selectedDifficulty: null,
        players: prev.players.map(p => ({ ...p, hasAnswered: false, selectedAnswer: undefined }))
      }
    })
  }, [])

  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isGameActive: false
    }))
  }, [])

  const selectCategory = useCallback((category: QuestionCategory) => {
    setGameState(prev => ({ ...prev, selectedCategory: category }))
  }, [])

  const selectDifficulty = useCallback((difficulty: DifficultyScore) => {
    setGameState(prev => ({ ...prev, selectedDifficulty: difficulty }))
  }, [])

  const getCurrentTurnPlayer = useCallback(() => {
    return gameState.players[gameState.currentTurnPlayerIndex]
  }, [gameState.players, gameState.currentTurnPlayerIndex])

  return {
    gameState,
    startGame,
    submitAnswer,
    nextQuestion,
    endGame,
    selectCategory,
    selectDifficulty,
    getCurrentTurnPlayer
  }
}
