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
  categories: string[]  // Array of categories
  difficulty: number
  correct_count: number
  incorrect_count: number
  recent_history: boolean[]
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
    categories: row.categories as QuestionCategory[],
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
    .filter('categories', 'cs', `{"${category}"}`)  // PostgreSQL array literal needs quotes around text values
    .order('difficulty', { ascending: true })

  if (error) {
    console.error('Database query error in getQuestionsByCategory:', error)
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
    // Use filter with @> (contains) operator for PostgreSQL array containment
    // PostgreSQL array literals need quotes around text values: {"value"}
    const filterValue = `{"${filters.category}"}`
    query = query.filter('categories', 'cs', filterValue)
  }
  if (filters.minDifficulty !== undefined) {
    query = query.gte('difficulty', filters.minDifficulty)
  }
  if (filters.maxDifficulty !== undefined) {
    query = query.lte('difficulty', filters.maxDifficulty)
  }

  const { data, error } = await query

  if (error) {
    console.error('Database query error:', error)
    console.error('Query filters:', filters)
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
    .select('categories')

  if (error) {
    throw new Error(`Failed to fetch question counts: ${error.message}`)
  }

  const counts: Record<string, number> = {}
  data?.forEach(row => {
    // Each question can contribute to multiple category counts
    row.categories?.forEach((category: string) => {
      counts[category] = (counts[category] || 0) + 1
    })
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

export async function updateQuestionStats(
  questionId: string,
  newDifficulty: number,
  correctCount: number,
  incorrectCount: number,
  recentHistory: boolean[]
): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .update({
      difficulty: newDifficulty,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      recent_history: recentHistory
    })
    .eq('id', questionId)

  if (error) {
    throw new Error(`Failed to update question stats: ${error.message}`)
  }
}

export async function getQuestionStats(questionId: string): Promise<{
  difficulty: number
  correct_count: number
  incorrect_count: number
  recent_history: boolean[]
}> {
  const { data, error } = await supabase
    .from('questions')
    .select('difficulty, correct_count, incorrect_count, recent_history')
    .eq('id', questionId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch question stats: ${error.message}`)
  }
  
  return {
    difficulty: data.difficulty,
    correct_count: data.correct_count || 0,
    incorrect_count: data.incorrect_count || 0,
    recent_history: data.recent_history || []
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
