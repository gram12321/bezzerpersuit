/**
 * Global type definitions for Bezzerpersuit
 */

/**
 * All available quiz categories
 */
export const QUIZ_CATEGORIES = [
  'Geography, Nature, and Environment',
  'Science and Technology',
  'Art, Literature, and Culture',
  'History',
  'Sports, Games, and Entertainment',
  'Food and Cooking',
  'Music and Performing Arts',
  'Business and Economics',
  'Mythology and Religion',
  'General Knowledge'
] as const

/**
 * Quiz category type derived from QUIZ_CATEGORIES array
 */
export type QuestionCategory = typeof QUIZ_CATEGORIES[number]

/**
 * Game phase for turn-based gameplay
 */
export type GamePhase = 'category-selection' | 'answering' | 'results'

/**
 */
export type DifficultyScore = number & { readonly __brand: 'DifficultyScore' }

export function createDifficultyScore(value: number): DifficultyScore {
  const clamped = Math.max(0, Math.min(1, value))
  return clamped as DifficultyScore
}

export interface Question {
  id: string
  question: string
  answers: string[]
  correctAnswerIndex: number
  categories: QuestionCategory[]  // Questions can belong to multiple categories
  difficulty: DifficultyScore
  correctCount?: number
  incorrectCount?: number
  recentHistory?: boolean[]
}

/**
 * Player in a game session
 */
export interface Player {
  id: string
  name: string
  isAI: boolean
  score: number
  isReady: boolean
  avatar?: string
  hasAnswered?: boolean
  selectedAnswer?: number
  iKnowPowerupsRemaining?: number
  usedIKnowThisRound?: boolean
}

/**
 * Configurable game options
 */
export interface GameOptions {
  questionsPerGame: number
  questionTimeLimit: number
  selectionTimeLimit: number
  iKnowPowerupsPerPlayer: number
}

/**
 * Lobby state during staging phase
 */
export interface LobbyState {
  id: string
  hostId: string
  players: Player[]
  maxPlayers: number
  isStarted: boolean
  createdAt: Date
  gameOptions: GameOptions
}
