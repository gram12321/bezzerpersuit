/**
 * Global type definitions for Bezzerpersuit
 */

/**
 * All available quiz categories
 */
export const QUIZ_CATEGORIES = [
  'Geography',
  'Nature and Ecology',
  'Natural Sciences',
  'Technology and Engineering',
  'Visual Arts and Design',
  'Literature and Narrative Arts',
  'History',
  'Sports, Games, and Entertainment',
  'Food and Cooking',
  'Music and Performing Arts',
  'Business and Economics',
  'Mythology and Religion',
  'Philosophy and Critical Thinking',
  'Medicine and Health Sciences',
  'Law, Government, and Politics',
  'General Knowledge'
] as const

/**
 * Quiz category type derived from QUIZ_CATEGORIES array
 */
export type QuestionCategory = typeof QUIZ_CATEGORIES[number]

/**
 * Question class values for geographic/cultural filtering
 */
export const QUESTION_CLASSES = [
  'Global', // equal to all
  'Western', // Cultural / Geographic seperation
  'Far East',// Cultural / Geographic seperation
  'Eastern', // Cultural / Geographic seperation
  'Latin', // Cultural / Geographic seperation
  'Africa',// Cultural / Geographic seperation
  'Middle East', // Cultural / Geographic seperation
  'United States', // Country specific
  'United Kingdom', // Country specific
  'Denmark', // Country specific
  'Germany' // Country specific
] as const

export type QuestionClass = typeof QUESTION_CLASSES[number]

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
  questionClass: QuestionClass[]  // Geographic/cultural classification (e.g., ['Global'], ['Western', 'Far East'])
  questionCollection: string[]  // Question collection(s) this belongs to (e.g., ['Basegame'], ['WW2', 'History Pack'])
  difficulty: DifficultyScore
  correctCount?: number
  incorrectCount?: number
  recentHistory?: boolean[]
}

/**
 * Player in a game session
 */
/**
 * AI Personality - Defines behavioral traits for AI opponents
 */
export interface AIPersonality {
  id: string
  name: string
  avatar: string
  description: string
  baseSuccessRate: number
  categoryModifiers: Partial<Record<QuestionCategory, number>>
  consistency: number
  boostUsageRate: number
}

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
  usedCategories?: QuestionCategory[]
  usedDifficulties?: DifficultyScore[]
  aiPersonality?: AIPersonality
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

// =====================================================
// AUTH & USER TYPES
// =====================================================

export interface User {
  id: string
  username: string
  avatarId?: string // Avatar emoji identifier (e.g., 'ninja', 'wizard', 'brain')
  avatarColor?: string // Optional color id for avatar background/styling
  questionSpoilers?: Record<string, number> // question_id -> spoiler_value mapping
}

export interface PlayerStats {
  id: string
  userId: string
  questionsAnswered: number
  correctAnswers: number
  incorrectAnswers: number
}

export interface GameSession {
  id: string
  userId: string
  score: number
  questionsAnswered: number
}
