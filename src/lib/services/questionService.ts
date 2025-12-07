import type { Question, QuestionCategory } from '@/lib/utils/types'
import { getQuestionsWithFilters, getQuestionDifficultyById, updateQuestionDifficultyById } from '@/database'

export async function fetchRandomQuestions(
  count: number = 8,
  category?: QuestionCategory,
  minDifficulty?: number,
  maxDifficulty?: number
): Promise<Question[]> {
  try {
    const questions = await getQuestionsWithFilters({
      category,
      minDifficulty,
      maxDifficulty
    })

    if (questions.length === 0) {
      throw new Error('No questions found matching criteria')
    }

    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(count, questions.length))
    
    return selected
  } catch (error) {
    console.error('Error in fetchRandomQuestions:', error)
    throw error
  }
}

// TODO: Implement Elo-like difficulty rating system (see docs/FUTURE_ENHANCEMENTS.md)
export async function updateQuestionDifficulty(
  questionId: string,
  wasCorrect: boolean
): Promise<number> {
  try {
    const currentDifficulty = await getQuestionDifficultyById(questionId)
    const adjustment = wasCorrect ? -0.1 : 0.1
    const newDifficulty = Math.max(0, Math.min(1, currentDifficulty + adjustment))
    await updateQuestionDifficultyById(questionId, newDifficulty)
    
    return newDifficulty
  } catch (error) {
    console.error('Error updating question difficulty:', error)
    throw error
  }
}
