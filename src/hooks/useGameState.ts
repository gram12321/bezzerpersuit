import { useState, useEffect, useCallback } from 'react'
import type { Question } from '@/lib/utils/types'
import { fetchRandomQuestions } from '@/lib/services'

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
}

export function useGameState() {
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
    questions: []
  })

  // Initialize game
  const startGame = useCallback(async () => {
    setGameState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Fetch random questions from Supabase
      const questions = await fetchRandomQuestions(8)
      
      setGameState({
        currentQuestionIndex: 0,
        score: 0,
        timeRemaining: 15,
        isGameActive: true,
        isLoading: false,
        error: null,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false,
        questions
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

  // Timer countdown
  useEffect(() => {
    if (!gameState.isGameActive || gameState.showResult) return

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          // Time's up - move to next question
          return {
            ...prev,
            timeRemaining: 0,
            showResult: true,
            isCorrect: false
          }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isGameActive, gameState.showResult, gameState.currentQuestionIndex])

  // Submit answer
  const submitAnswer = useCallback((answerIndex: number) => {
    setGameState(prev => {
      const currentQuestion = prev.questions[prev.currentQuestionIndex]
      const isCorrect = answerIndex === currentQuestion.correctAnswerIndex
      // Use game service for point calculation
      const points = isCorrect ? (prev.timeRemaining * 10) : 0

      return {
        ...prev,
        selectedAnswer: answerIndex,
        showResult: true,
        isCorrect,
        score: prev.score + points
      }
    })
  }, [])

  // Next question
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

  // End game
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
