import { supabase } from "@/database/supabase"
import type { Question } from "@/lib/types"

export interface AdminQuestionStats {
  totalQuestions: number
  questionsByCategory: Record<string, number>
  difficultyDistribution: Record<string, number>
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
    category: q.category,
    difficulty: q.difficulty
  }))
}

export async function getQuestionStats(): Promise<AdminQuestionStats> {
  const questions = await getAllQuestionsForAdmin()

  const stats: AdminQuestionStats = {
    totalQuestions: questions.length,
    questionsByCategory: {},
    difficultyDistribution: {},
  }

  questions.forEach(q => {
    stats.questionsByCategory[q.category] = (stats.questionsByCategory[q.category] || 0) + 1
    const difficultyLabel = getDifficultyLabel(q.difficulty)
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
  if (difficulty < 0.2) return 'Easy'
  if (difficulty < 0.4) return 'Medium-Easy'
  if (difficulty < 0.6) return 'Medium'
  if (difficulty < 0.8) return 'Medium-Hard'
  return 'Hard'
}
