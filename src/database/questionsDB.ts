import { supabase } from '@/database/supabase'
import type { Question, QuestionCategory } from '@/lib/utils/types'
import { createDifficultyScore } from '@/lib/utils/types'

/**
 * Database row type from Supabase
 */
interface QuestionRow {
  id: string
  question: string
  answers: string[]
  correct_answer_index: number
  category: string
  difficulty: number
  created_at: string
  updated_at: string
}

/**
 * Convert database row to Question type
 */
function mapRowToQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    question: row.question,
    answers: row.answers,
    correctAnswerIndex: row.correct_answer_index,
    category: row.category as QuestionCategory,
    difficulty: createDifficultyScore(row.difficulty)
  }
}

export async function getAllQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`)
  }

  return (data || []).map(mapRowToQuestion)
}

export async function getQuestionsByCategory(category: QuestionCategory): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category', category)
    .order('difficulty', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`)
  }

  return (data || []).map(mapRowToQuestion)
}

export async function getQuestionsByDifficultyRange(
  minDifficulty: number,
  maxDifficulty: number
): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .gte('difficulty', minDifficulty)
    .lte('difficulty', maxDifficulty)
    .order('difficulty', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`)
  }

  return (data || []).map(mapRowToQuestion)
}

export async function getQuestionsWithFilters(filters: {
  category?: QuestionCategory
  minDifficulty?: number
  maxDifficulty?: number
}): Promise<Question[]> {
  let query = supabase.from('questions').select('*')

  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.minDifficulty !== undefined) {
    query = query.gte('difficulty', filters.minDifficulty)
  }
  if (filters.maxDifficulty !== undefined) {
    query = query.lte('difficulty', filters.maxDifficulty)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`)
  }

  return (data || []).map(mapRowToQuestion)
}

export async function getQuestionCount(): Promise<number> {
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })

  if (error) {
    throw new Error(`Failed to fetch question count: ${error.message}`)
  }

  return count || 0
}

export async function getQuestionCountByCategory(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('questions')
    .select('category')

  if (error) {
    throw new Error(`Failed to fetch question counts: ${error.message}`)
  }

  const counts: Record<string, number> = {}
  data?.forEach(row => {
    counts[row.category] = (counts[row.category] || 0) + 1
  })

  return counts
}

export async function updateQuestionDifficultyById(
  questionId: string,
  newDifficulty: number
): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .update({ difficulty: newDifficulty })
    .eq('id', questionId)

  if (error) {
    throw new Error(`Failed to update question difficulty: ${error.message}`)
  }
}

export async function getQuestionDifficultyById(questionId: string): Promise<number> {
  const { data, error } = await supabase
    .from('questions')
    .select('difficulty')
    .eq('id', questionId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch question difficulty: ${error.message}`)
  }

  return data.difficulty
}
