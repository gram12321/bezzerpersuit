/**
 * Global type definitions for Bezzerpersuit
 */

export type QuestionCategory = 
  | 'Geography, Nature, and Environment'
  | 'Science and technology'
  | 'Art, Literature, And Culture'
  | 'History'
  | 'Sports, Games, and Entertainment'


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
  category: QuestionCategory
  difficulty: DifficultyScore
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
}
