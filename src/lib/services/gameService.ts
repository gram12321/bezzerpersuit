import type { Player, Question } from '@/lib/utils/types'

/**
 * Game Service - Business logic for quiz game flow and state transitions
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

/**
 * Check if all players have answered the current question
 */
export function haveAllPlayersAnswered(players: Player[]): boolean {
  return players.every(p => p.hasAnswered)
}

/**
 * Get the next turn player index
 */
export function getNextTurnPlayerIndex(currentIndex: number, totalPlayers: number): number {
  return (currentIndex + 1) % totalPlayers
}

/**
 * Check if the game should end (reached last question)
 */
export function isLastQuestion(currentQuestionIndex: number, totalQuestions: number): boolean {
  return currentQuestionIndex >= totalQuestions - 1
}

/**
 * Auto-submit answers for players who haven't answered
 * Sets selectedAnswer to 0 (first option) for unanswered players
 */
export function autoSubmitUnansweredPlayers(players: Player[]): Player[] {
  return players.map(p => {
    if (!p.hasAnswered) {
      return { ...p, hasAnswered: true, selectedAnswer: 0 }
    }
    return p
  })
}

/**
 * Reset player answer state for next question
 */
export function resetPlayerAnswers(players: Player[]): Player[] {
  return players.map(p => ({
    ...p,
    hasAnswered: false,
    selectedAnswer: undefined
  }))
}

/**
 * Update a single player's answer
 */
export function updatePlayerAnswer(
  players: Player[],
  playerId: string,
  answerIndex: number
): Player[] {
  return players.map(p => {
    if (p.id === playerId) {
      return { ...p, hasAnswered: true, selectedAnswer: answerIndex }
    }
    return p
  })
}


