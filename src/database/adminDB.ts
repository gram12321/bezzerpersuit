import { supabase } from "@/database/supabase"
import type { Question } from "@/lib/types"
import { QUIZ_DIFFICULTY_LEVELS } from "@/lib/utils/utils"

export interface AdminQuestionStats {
  totalQuestions: number
  questionsByCategory: Record<string, number>
  difficultyDistribution: Record<string, number>
  categoryDifficultyMatrix: Record<string, Record<string, number>>  // category -> difficulty level -> count
}

export async function getAllQuestionsForAdmin(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching questions for admin:', error)
    throw new Error(`Failed to fetch questions: ${error.message}`)
  }

  return (data || []).map(q => ({
    id: q.id,
    question: q.question,
    answers: q.answers,
    correctAnswerIndex: q.correct_answer_index,
    categories: q.categories || [],
    difficulty: q.difficulty
  }))
}

export async function getQuestionStats(): Promise<AdminQuestionStats> {
  const questions = await getAllQuestionsForAdmin()

  const stats: AdminQuestionStats = {
    totalQuestions: questions.length,
    questionsByCategory: {},
    difficultyDistribution: {},
    categoryDifficultyMatrix: {},
  }

  questions.forEach(q => {
    const difficultyLabel = getDifficultyLabel(q.difficulty)
    
    // Each question can contribute to multiple category counts
    q.categories?.forEach(category => {
      stats.questionsByCategory[category] = (stats.questionsByCategory[category] || 0) + 1
      
      // Build category/difficulty matrix
      if (!stats.categoryDifficultyMatrix[category]) {
        stats.categoryDifficultyMatrix[category] = {}
      }
      stats.categoryDifficultyMatrix[category][difficultyLabel] = 
        (stats.categoryDifficultyMatrix[category][difficultyLabel] || 0) + 1
    })
    
    stats.difficultyDistribution[difficultyLabel] = (stats.difficultyDistribution[difficultyLabel] || 0) + 1
  })

  return stats
}

export async function deleteQuestionById(questionId: string): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) {
    console.error('Error deleting question:', error)
    throw new Error(`Failed to delete question: ${error.message}`)
  }
}

export async function updateQuestion(
  questionId: string,
  updates: Partial<Question>
): Promise<Question> {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', questionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating question:', error)
    throw new Error(`Failed to update question: ${error.message}`)
  }

  return data
}

function getDifficultyLabel(difficulty: number): string {
  const clamped = Math.max(0, Math.min(1, difficulty))
  const level = QUIZ_DIFFICULTY_LEVELS.find(entry => clamped <= entry.max)
  return level?.category || 'Unknown'
}
