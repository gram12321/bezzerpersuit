import type { Question } from '@/lib/utils/types'

/**
 * Game Service - Business logic for quiz game mechanics
 */

export interface GameSession {
  questions: Question[]
  currentQuestionIndex: number
  score: number
  answers: GameAnswer[]
}

export interface GameAnswer {
  questionId: string
  selectedAnswerIndex: number
  isCorrect: boolean
  pointsEarned: number
}

/**
 * Calculate points for an answer
 */
export function calculatePoints(isCorrect: boolean): number {
  if (!isCorrect) return 0
  return 1
}

/**
 * Calculate final game statistics
 */
export function calculateGameStats(session: GameSession): {
  totalQuestions: number
  correctAnswers: number
  totalScore: number
  accuracy: number
} {
  const totalQuestions = session.questions.length
  const correctAnswers = session.answers.filter(a => a.isCorrect).length
  const totalScore = session.score
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

  return {
    totalQuestions,
    correctAnswers,
    totalScore,
    accuracy
  }
}


