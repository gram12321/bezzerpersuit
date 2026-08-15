import { useState, useEffect, useCallback, useRef } from 'react'
import type { Question, Player, LobbyState, GamePhase, QuestionCategory, DifficultyScore, GameOptions } from '@/lib/utils'
import { fetchRandomQuestions, updateQuestionStatsFromPlayers, playerStatsService, updatePlayerSpoilerValues } from '@/lib/services'
import {
  haveAllPlayersAnswered,
  getNextTurnPlayerId,
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
import { selectAICategoryAndDifficulty, generateAIAnswers, processAIBoosts } from '@/lib/services/ai/aiLogic'
import { QUESTIONS_PER_GAME, QUESTION_TIME_LIMIT, SELECTION_TIME_LIMIT, I_KNOW_POWERUPS_PER_PLAYER } from '@/lib/utils'

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
  currentTurnPlayerId: string // canonical turn player reference
  selectedCategory: QuestionCategory | null
  selectedDifficulty: DifficultyScore | null
  currentSelectionCategory: QuestionCategory | null
  currentSelectionDifficulty: DifficultyScore | null
  gameOptions: GameOptions | null
}

import { authService } from '@/lib/services'
import { supabase } from '@/database/supabase'

/**
 * Helper to update all stats (Question difficulty, Spoilers, Player stats)
 * Fire and forget - does not block UI
 */
const updateAllGameStats = async (question: Question, players: Player[]) => {
  let currentUser = authService.getCurrentUser()

  // Fallback: Check Supabase directly if authService user is missing (e.g. race condition)
  if (!currentUser) {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      currentUser = { id: data.user.id, username: 'unknown', avatarId: '1' }
    }
  }

  if (!currentUser) {
    console.log('No authenticated user found for stats update')
    return
  }

  // 1. Update Question Difficulty & History
  // Designate the first human player as the "reporter" for global stats to avoid duplicates
  // This ensures updates happen even during AI turns (as long as a human is present)
  const firstHumanPlayer = players.find(p => !p.isAI && p.id)
  const isReporter = firstHumanPlayer?.id === currentUser.id

  if (isReporter) {
    updateQuestionStatsFromPlayers(question, players).catch(e => console.error('Question stats update error:', e))
  }

  // 2. Update User Spoilers
  // Only update for the current authenticated user
  const currentPlayerInGame = players.find(p => p.id === currentUser.id)
  if (currentPlayerInGame) {
    // Pass only the current player to avoid trying to update others (which would fail RLS)
    updatePlayerSpoilerValues(question, [currentPlayerInGame]).catch(e => console.error('Spoiler update error:', e))
  } else {
    console.log('Current user not found in game players list', currentUser.id, players)
  }

  // 3. Update User Player Stats
  // Only update for the current authenticated user
  if (currentPlayerInGame && !currentPlayerInGame.isAI) {
    const wasCorrect = currentPlayerInGame.selectedAnswer === question.correctAnswerIndex
    playerStatsService.updateStats(currentUser.id, wasCorrect)
      .catch(e => console.error('Player stats update error:', e))
  }
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
    currentTurnPlayerId: (initialLobby?.players && initialLobby.players.length > 0) ? initialLobby.players[0].id : '',
    selectedCategory: null,
    selectedDifficulty: null,
    currentSelectionCategory: null,
    currentSelectionDifficulty: null,
    gameOptions: initialLobby?.gameOptions || null
  })

  // Ref to track which questions we've already updated stats for
  const lastProcessedQuestionRef = useRef<string | null>(null)
  const isFetchingRef = useRef(false)
  const aiTurnTimersRef = useRef<number[]>([])

  const startGame = useCallback(async (lobby?: LobbyState) => {
    setGameState(prev => {
      const players = lobby?.players || prev.players
      const currentPlayerId = lobby?.players.find(p => !p.isAI)?.id || prev.currentPlayerId
      const questionTimeLimit = lobby?.gameOptions.questionTimeLimit || QUESTION_TIME_LIMIT
      const selectionTimeLimit = lobby?.gameOptions.selectionTimeLimit || SELECTION_TIME_LIMIT
      const iKnowPowerups = lobby?.gameOptions.iKnowPowerupsPerPlayer ?? I_KNOW_POWERUPS_PER_PLAYER
      const firstTurnPlayerId = (players && players.length > 0) ? players[0].id : ''

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
        currentTurnPlayerId: firstTurnPlayerId,
        selectedCategory: null,
        selectedDifficulty: null,
        currentSelectionCategory: null,
        currentSelectionDifficulty: null,
        gameOptions: lobby?.gameOptions || initialLobby?.gameOptions || prev.gameOptions
      }
    })
  }, [initialLobby])

  // Selection timer countdown
  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'category-selection') return

    const timer = setInterval(() => {
      setGameState(prev => {
        // Stop timer if selection is already complete or loading
        if ((prev.selectedCategory && prev.selectedDifficulty) || prev.isLoading) {
          return prev
        }

        // Skip countdown if unlimited time (999)
        if (prev.selectionTimeRemaining === 999) {
          return prev
        }

        // Prevent negative time and multiple triggers
        if (prev.selectionTimeRemaining <= 0) {
          return prev
        }

        if (prev.selectionTimeRemaining === 1) {
          // Time's up - auto-select using AI logic
          const currentPlayer = prev.players.find(p => p.id === prev.currentTurnPlayerId)
          if (!currentPlayer) {
            return { ...prev, selectionTimeRemaining: 0 }
          }

          const { category, difficulty } = selectAICategoryAndDifficulty(
            currentPlayer.aiPersonality,
            currentPlayer.usedCategories || [],
            currentPlayer.usedDifficulties || []
          )

          return {
            ...prev,
            selectionTimeRemaining: 0,
            selectedCategory: category,
            selectedDifficulty: difficulty
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

    const currentTurnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId)
    if (!currentTurnPlayer?.isAI) {
      return
    }

    // Don't run if selections are already made or if we're loading
    if (gameState.selectedCategory || gameState.selectedDifficulty || gameState.isLoading) {
      return
    }

    const { category, difficulty } = selectAICategoryAndDifficulty(
      currentTurnPlayer.aiPersonality,
      currentTurnPlayer.usedCategories || [],
      currentTurnPlayer.usedDifficulties || []
    )

    // Clear any existing timers before starting new sequence
    aiTurnTimersRef.current.forEach(clearTimeout)
    aiTurnTimersRef.current = []

    const t1 = window.setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        currentSelectionCategory: category
      }))

      const t2 = window.setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          currentSelectionDifficulty: difficulty
        }))

        const t3 = window.setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            selectedCategory: category,
            selectedDifficulty: difficulty
          }))
        }, 800)
        aiTurnTimersRef.current.push(t3)
      }, 1500)
      aiTurnTimersRef.current.push(t2)
    }, 1000)
    aiTurnTimersRef.current.push(t1)

    return () => {
      aiTurnTimersRef.current.forEach(clearTimeout)
      aiTurnTimersRef.current = []
    }
  }, [gameState.isGameActive, gameState.gamePhase, gameState.currentTurnPlayerId])

  // Load question when both category and difficulty are selected, with a brief delay
  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'category-selection') {
      return
    }

    // We need BOTH to be selected, and we MUST NOT be already loading
    if (!gameState.selectedCategory || !gameState.selectedDifficulty || gameState.isLoading || isFetchingRef.current) {
      return
    }

    // Add a delay before loading the question, but do not set isLoading yet
    const timer = window.setTimeout(async () => {
      // Re-verify conditions inside the timeout callback
      if (isFetchingRef.current) {
        console.log('[useGameState] Suppressing concurrent fetch request')
        return
      }

      console.log('[useGameState] requesting question', {
        selectedCategory: gameState.selectedCategory,
        selectedDifficulty: gameState.selectedDifficulty
      })

      isFetchingRef.current = true
      setGameState(prev => ({ ...prev, isLoading: true, error: null }))

      const humanPlayerIds = gameState.players
        .filter(p => !p.isAI && p.id)
        .map(p => p.id)
      const turnPlayerId = gameState.currentTurnPlayerId

      const QUESTION_FETCH_TIMEOUT_MS = 10000

      try {
        const fetchPromise = fetchRandomQuestions(
          1,
          gameState.selectedCategory!,
          gameState.selectedDifficulty!,
          humanPlayerIds,
          turnPlayerId,
          gameState.gameOptions?.enabledCollections || []
        )

        const timeoutPromise = new Promise<Question[]>((_, reject) =>
          setTimeout(() => reject(new Error('Question fetch timed out')), QUESTION_FETCH_TIMEOUT_MS)
        )

        const questions = await Promise.race([fetchPromise, timeoutPromise])

        if (questions.length === 0) {
          throw new Error('No questions found')
        }

        console.log('[useGameState] Question fetched successfully, transitioning phase')

        setGameState(prev => {
          const turnPlayerId = prev.currentTurnPlayerId
          let updatedPlayers = markPlayerCategoryUsed(prev.players, turnPlayerId, prev.selectedCategory!)
          updatedPlayers = markPlayerDifficultyUsed(updatedPlayers, turnPlayerId, prev.selectedDifficulty!)
          updatedPlayers = resetPlayerAnswers(updatedPlayers)

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
      } catch (error) {
        console.error('[useGameState] Failed to load question:', error)

        setGameState(prev => ({
          ...prev,
          isLoading: false,
          selectedCategory: null,
          selectedDifficulty: null,
          currentSelectionCategory: null,
          currentSelectionDifficulty: null,
          error: error instanceof Error ? error.message : 'Failed to load question. Please try anther combination.'
        }))
      } finally {
        isFetchingRef.current = false
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [gameState.selectedCategory, gameState.selectedDifficulty, gameState.gamePhase, gameState.isGameActive])

  // AI players decide on boost usage and auto-answer when question loads
  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'answering') return

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
    if (!currentQuestion) return

    setGameState(prev => {
      // First, AIs decide whether to use boosts
      let updatedPlayers = processAIBoosts(prev.players, currentQuestion, prev.currentTurnPlayerId)
      // Then, AIs generate their answers
      updatedPlayers = generateAIAnswers(updatedPlayers, currentQuestion)

      return {
        ...prev,
        players: updatedPlayers
      }
    })
  }, [gameState.isGameActive, gameState.gamePhase, gameState.currentQuestionIndex])

  // Handle side effects when a question is completed (entered 'results' phase)
  useEffect(() => {
    if (gameState.gamePhase === 'results') {
      const currentQuestion = gameState.questions[gameState.currentQuestionIndex]

      // Ensure we only process stats once per question
      if (currentQuestion && lastProcessedQuestionRef.current !== currentQuestion.id) {
        lastProcessedQuestionRef.current = currentQuestion.id
        updateAllGameStats(currentQuestion, gameState.players)
      }
    }
  }, [gameState.gamePhase, gameState.currentQuestionIndex, gameState.questions, gameState.players])

  useEffect(() => {
    if (!gameState.isGameActive || gameState.gamePhase !== 'answering') return

    const timer = setInterval(() => {
      setGameState(prev => {
        // Skip countdown if unlimited time (999)
        if (prev.timeRemaining === 999) {
          return prev
        }

        if (prev.timeRemaining <= 1) {
          const currentQuestion = prev.questions[prev.currentQuestionIndex]

          // Auto-submit for players who haven't answered
          const finalPlayers = autoSubmitUnansweredPlayers(prev.players)

          // Calculate scores using service
          const scoredPlayers = applyScores(
            finalPlayers,
            prev.currentTurnPlayerId,
            currentQuestion
          )

          const turnPlayerAnswer = finalPlayers.find(p => p.id === prev.currentTurnPlayerId)?.selectedAnswer ?? null
          const turnPlayerCorrect = turnPlayerAnswer !== null
            ? isAnswerCorrect(turnPlayerAnswer, currentQuestion)
            : false



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
          prev.currentTurnPlayerId,
          currentQuestion
        )



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

      // Compute next turn player ID using helper to avoid index misuse
      const nextTurnPlayerId = getNextTurnPlayerId(prev.currentTurnPlayerId, prev.players)
      const nextPlayer = prev.players.find(p => p.id === nextTurnPlayerId)

      if (!nextPlayer || !nextTurnPlayerId) {
        return {
          ...prev,
          isGameActive: false,
          error: 'Next turn player not found. Game cannot continue.'
        }
      }
      const questionTimeLimit = initialLobby?.gameOptions.questionTimeLimit || QUESTION_TIME_LIMIT
      const selectionTimeLimit = initialLobby?.gameOptions.selectionTimeLimit || SELECTION_TIME_LIMIT

      // Check if next turn player needs their categories or difficulties reset
      let updatedPlayers = prev.players

      if (areAllCategoriesUsed(nextPlayer.usedCategories || [])) {
        updatedPlayers = resetPlayerCategories(updatedPlayers, nextPlayer.id)
      }

      if (areAllDifficultiesUsed(nextPlayer.usedDifficulties || [])) {
        updatedPlayers = resetPlayerDifficulties(updatedPlayers, nextPlayer.id)
      }

      updatedPlayers = resetPlayerAnswers(updatedPlayers).map(p => ({ ...p, usedIKnowThisRound: false }))

      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentTurnPlayerId: nextTurnPlayerId,
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
    setGameState(prev => {
      const isAlreadySelected = prev.selectedCategory === category
      return {
        ...prev,
        selectedCategory: isAlreadySelected ? null : category,
        currentSelectionCategory: isAlreadySelected ? null : category
      }
    })
  }, [])

  const selectDifficulty = useCallback((difficulty: DifficultyScore) => {
    setGameState(prev => {
      const isAlreadySelected = prev.selectedDifficulty &&
        Math.abs(prev.selectedDifficulty - difficulty) < 0.01

      return {
        ...prev,
        selectedDifficulty: isAlreadySelected ? null : difficulty,
        currentSelectionDifficulty: isAlreadySelected ? null : difficulty
      }
    })
  }, [])

  const getCurrentTurnPlayer = useCallback(() => {
    return gameState.players.find(p => p.id === gameState.currentTurnPlayerId)
  }, [gameState.players, gameState.currentTurnPlayerId])

  const useIKnow = useCallback((playerId: string) => {
    setGameState(prev => {
      const player = prev.players.find(p => p.id === playerId)

      // Validation checks
      if (!player || player.id === prev.currentTurnPlayerId) {
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
