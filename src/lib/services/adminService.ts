import {
  getAllQuestionsForAdmin,
  getQuestionStats,
  deleteQuestionById,
  updateQuestion,
  type AdminQuestionStats,
} from "@/database/adminDB"
import type { Question } from "@/lib/utils/types"

/**
 * Admin service for managing quiz questions and statistics
 */

export interface AdminServiceState {
  questions: Question[]
  stats: AdminQuestionStats | null
  isLoading: boolean
  error: string | null
}

/**
 * Load all questions for admin view
 */
export async function loadAllQuestionsForAdmin(): Promise<Question[]> {
  try {
    const questions = await getAllQuestionsForAdmin()
    return questions
  } catch (error) {
    console.error('Error loading questions:', error)
    throw error
  }
}

/**
 * Load question statistics
 */
export async function loadQuestionStats(): Promise<AdminQuestionStats> {
  try {
    const stats = await getQuestionStats()
    return stats
  } catch (error) {
    console.error('Error loading question stats:', error)
    throw error
  }
}

/**
 * Delete a question and return updated list
 */
export async function removeQuestion(questionId: string): Promise<Question[]> {
  try {
    await deleteQuestionById(questionId)
    // Return updated list
    return await loadAllQuestionsForAdmin()
  } catch (error) {
    console.error('Error removing question:', error)
    throw error
  }
}

/**
 * Update a question field
 */
export async function modifyQuestion(
  questionId: string,
  updates: Partial<Question>
): Promise<Question> {
  try {
    const updatedQuestion = await updateQuestion(questionId, updates)
    return updatedQuestion
  } catch (error) {
    console.error('Error modifying question:', error)
    throw error
  }
}
