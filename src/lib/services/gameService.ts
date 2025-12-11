import type { Player, Question, QuestionCategory, DifficultyScore } from '@/lib/utils'
import { QUIZ_CATEGORIES, QUIZ_DIFFICULTY_LEVELS, createDifficultyScore } from '@/lib/utils'

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
 * Get the next turn player's ID given the current turn player's ID and players list
 * This centralizes index lookup and prevents callers from computing indices themselves.
 */
export function getNextTurnPlayerId(currentTurnPlayerId: string, players: Player[]): string {
  if (!players || players.length === 0) return ''
  const currentIndex = players.findIndex(p => p.id === currentTurnPlayerId)
  const startIndex = currentIndex === -1 ? 0 : currentIndex
  const nextIndex = (startIndex + 1) % players.length
  return players[nextIndex]?.id || ''
}

/**
 * Utility for post-selection delay (category/difficulty)
 * Returns a promise that resolves after the given ms
 */
export function postSelectionDelay(ms: number = 2000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
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

// =====================================================
// CATEGORY & DIFFICULTY SELECTION TRACKING
// =====================================================

/**
 * Check if a category has already been used by a player
 */
export function isCategoryUsed(
  category: QuestionCategory,
  usedCategories: QuestionCategory[]
): boolean {
  return usedCategories.includes(category)
}

/**
 * Check if a difficulty has already been used by a player
 * Compares with tolerance to account for floating point precision
 */
export function isDifficultyUsed(
  difficulty: DifficultyScore,
  usedDifficulties: DifficultyScore[]
): boolean {
  return usedDifficulties.some(used => Math.abs(used - difficulty) < 0.01)
}

/**
 * Mark a category as used for a specific player
 */
export function markPlayerCategoryUsed(
  players: Player[],
  playerId: string,
  category: QuestionCategory
): Player[] {
  return players.map(p => {
    if (p.id === playerId) {
      const usedCategories = p.usedCategories || []
      if (isCategoryUsed(category, usedCategories)) {
        return p
      }
      return { ...p, usedCategories: [...usedCategories, category] }
    }
    return p
  })
}

/**
 * Mark a difficulty as used for a specific player
 */
export function markPlayerDifficultyUsed(
  players: Player[],
  playerId: string,
  difficulty: DifficultyScore
): Player[] {
  return players.map(p => {
    if (p.id === playerId) {
      const usedDifficulties = p.usedDifficulties || []
      if (isDifficultyUsed(difficulty, usedDifficulties)) {
        return p
      }
      return { ...p, usedDifficulties: [...usedDifficulties, difficulty] }
    }
    return p
  })
}

/**
 * Get available (unused) categories
 */
export function getAvailableCategories(
  usedCategories: QuestionCategory[]
): QuestionCategory[] {
  return QUIZ_CATEGORIES.filter(cat => !isCategoryUsed(cat, usedCategories))
}

/**
 * Get available (unused) difficulties
 */
export function getAvailableDifficulties(
  usedDifficulties: DifficultyScore[]
): DifficultyScore[] {
  return QUIZ_DIFFICULTY_LEVELS.map(level => {
    // Round to 2 decimal places to avoid floating-point precision errors
    const midpoint = Math.round((level.max - 0.05) * 100) / 100
    return createDifficultyScore(midpoint)
  }).filter(diff => !isDifficultyUsed(diff, usedDifficulties))
}

/**
 * Check if all categories have been used by a player
 */
export function areAllCategoriesUsed(usedCategories: QuestionCategory[]): boolean {
  return usedCategories.length >= QUIZ_CATEGORIES.length
}

/**
 * Check if all difficulties have been used by a player
 */
export function areAllDifficultiesUsed(usedDifficulties: DifficultyScore[]): boolean {
  return usedDifficulties.length >= QUIZ_DIFFICULTY_LEVELS.length
}

/**
 * Reset a player's category tracking (allow all categories again)
 */
export function resetPlayerCategories(
  players: Player[],
  playerId: string
): Player[] {
  return players.map(p => {
    if (p.id === playerId) {
      return { ...p, usedCategories: [] }
    }
    return p
  })
}

/**
 * Reset a player's difficulty tracking (allow all difficulties again)
 */
export function resetPlayerDifficulties(
  players: Player[],
  playerId: string
): Player[] {
  return players.map(p => {
    if (p.id === playerId) {
      return { ...p, usedDifficulties: [] }
    }
    return p
  })
}


