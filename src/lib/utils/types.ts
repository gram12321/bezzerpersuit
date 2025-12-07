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
