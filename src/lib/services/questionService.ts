import type { Question, QuestionCategory } from '@/lib/utils/types'
import { getQuestionsWithFilters, getQuestionDifficultyById, updateQuestionDifficultyById } from '@/database'

/**
 * Question Service - Business logic for quiz questions
 * Uses repository layer for data access
 */

/**
 * Fetch random questions for a quiz session
 * @param count Number of questions to fetch (default: 8)
 * @param category Optional category filter
 * @param minDifficulty Optional minimum difficulty (0-1)
 * @param maxDifficulty Optional maximum difficulty (0-1)
 */
export async function fetchRandomQuestions(
  count: number = 8,
  category?: QuestionCategory,
  minDifficulty?: number,
  maxDifficulty?: number
): Promise<Question[]> {
  try {
    // Fetch questions with filters from repository
    const questions = await getQuestionsWithFilters({
      category,
      minDifficulty,
      maxDifficulty
    })

    if (questions.length === 0) {
      throw new Error('No questions found matching criteria')
    }

    // Business logic: Shuffle and select requested count
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(count, questions.length))
    
    return selected
  } catch (error) {
    console.error('Error in fetchRandomQuestions:', error)
    throw error
  }
}

/**
 * Update question difficulty rating based on player answers
 * 
 * Current: Simple algorithm - adjust by ±0.1 based on correct/incorrect answer
 * 
 * TODO: Implement advanced difficulty rating algorithm (see docs/FUTURE_ENHANCEMENTS.md)
 * - Consider player skill level
 * - Use statistical analysis (Elo-like system)
 * 
 * @param questionId Question ID to update
 * @param wasCorrect Whether the player answered correctly
 * @returns New difficulty rating (0-1)
 */
export async function updateQuestionDifficulty(
  questionId: string,
  wasCorrect: boolean
): Promise<number> {
  try {
    // Get current difficulty from database
    const currentDifficulty = await getQuestionDifficultyById(questionId)
    
    // Simple algorithm: adjust by ±0.1
    // If answered correctly, question gets easier (-0.1)
    // If answered incorrectly, question gets harder (+0.1)
    const adjustment = wasCorrect ? -0.1 : 0.1
    const newDifficulty = Math.max(0, Math.min(1, currentDifficulty + adjustment))
    
    // Save to database
    await updateQuestionDifficultyById(questionId, newDifficulty)
    
    return newDifficulty
  } catch (error) {
    console.error('Error updating question difficulty:', error)
    throw error
  }
}
