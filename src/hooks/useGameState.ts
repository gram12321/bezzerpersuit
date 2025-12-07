import { useState, useEffect, useCallback } from 'react'
import type { Question, Player, LobbyState } from '@/lib/utils/types'
import { fetchRandomQuestions } from '@/lib/services'
import { processAIAnswers } from '@/lib/ai'

export interface GameState {
  currentQuestionIndex: number
  score: number
  timeRemaining: number
  isGameActive: boolean
  isLoading: boolean
  error: string | null
  selectedAnswer: number | null
  showResult: boolean
  isCorrect: boolean
  questions: Question[]
  players: Player[]
  currentPlayerId: string
}

export function useGameState(initialLobby?: LobbyState) {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    timeRemaining: 15,
    isGameActive: false,
    isLoading: false,
    error: null,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    questions: [],
    players: initialLobby?.players || [],
    currentPlayerId: initialLobby?.players.find(p => !p.isAI)?.id || ''
  })

  const startGame = useCallback(async (lobby?: LobbyState) => {
    setGameState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const questions = await fetchRandomQuestions(8)
      
      setGameState(prev => {
        const players = lobby?.players || prev.players
        const currentPlayerId = lobby?.players.find(p => !p.isAI)?.id || prev.currentPlayerId
        
        return {
          currentQuestionIndex: 0,
          score: 0,
          timeRemaining: 15,
          isGameActive: true,
          isLoading: false,
          error: null,
          selectedAnswer: null,
          showResult: false,
          isCorrect: false,
          questions,
          players,
          currentPlayerId
        }
      })
    } catch (error) {
      console.error('Failed to load questions:', error)
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load questions. Please try again.',
        isGameActive: false
      }))
    }
  }, [])

  useEffect(() => {
    if (!gameState.isGameActive || gameState.showResult) return

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          // Auto-submit answer A (index 0) when time runs out
          const currentQuestion = prev.questions[prev.currentQuestionIndex]
          const isCorrect = 0 === currentQuestion.correctAnswerIndex
          const points = isCorrect ? 1 : 0

          // Update current player's score
          const updatedPlayers = prev.players.map(p =>
            p.id === prev.currentPlayerId
              ? { ...p, score: p.score + points }
              : p
          )

          // Process AI answers
          const playersWithAIAnswers = processAIAnswers(
            updatedPlayers,
            prev.currentPlayerId,
            currentQuestion
          )

          return {
            ...prev,
            timeRemaining: 0,
            selectedAnswer: 0,
            showResult: true,
            isCorrect,
            score: prev.score + points,
            players: playersWithAIAnswers
          }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isGameActive, gameState.showResult, gameState.currentQuestionIndex])

  const submitAnswer = useCallback((answerIndex: number) => {
    setGameState(prev => {
      const currentQuestion = prev.questions[prev.currentQuestionIndex]
      const isCorrect = answerIndex === currentQuestion.correctAnswerIndex
      const points = isCorrect ? 1 : 0

      // Update current player's score
      const updatedPlayers = prev.players.map(p =>
        p.id === prev.currentPlayerId
          ? { ...p, score: p.score + points }
          : p
      )

      // Process AI answers
      const playersWithAIAnswers = processAIAnswers(
        updatedPlayers,
        prev.currentPlayerId,
        currentQuestion
      )

      return {
        ...prev,
        selectedAnswer: answerIndex,
        showResult: true,
        isCorrect,
        score: prev.score + points,
        players: playersWithAIAnswers
      }
    })
  }, [])

  const nextQuestion = useCallback(() => {
    setGameState(prev => {
      const isLastQuestion = prev.currentQuestionIndex >= prev.questions.length - 1
      
      if (isLastQuestion) {
        return {
          ...prev,
          isGameActive: false
        }
      }

      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        timeRemaining: 15,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false
      }
    })
  }, [])

  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isGameActive: false
    }))
  }, [])

  return {
    gameState,
    startGame,
    submitAnswer,
    nextQuestion,
    endGame
  }
}
