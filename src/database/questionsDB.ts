import { supabase } from '@/database/supabase'
import type { Question, QuestionCategory, QuestionClass, QuestionCollection } from '@/lib/utils'
import { createDifficultyScore } from '@/lib/utils'

/**
 * Database row type from Supabase
 */
interface QuestionRow {
  id: string
  question: string
  answers: string[]
  correct_answer_index: number
  categories: string[]  // Array of categories
  question_class: string[]  // Array of geographic/cultural classifications
  question_collection: string[]  // Array of collection names
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
    questionClass: row.question_class as QuestionClass[],
    questionCollection: row.question_collection as QuestionCollection[],
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
  collections?: QuestionCollection[]  // Filter by collections (empty = all)
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
  if (filters.collections && filters.collections.length > 0) {
    // Filter to only questions that have at least one of the enabled collections
    // Use the overlap operator (&&) to check if arrays have any common elements
    const collectionsArray = `{${filters.collections.map(c => `"${c}"`).join(',')}}`
    query = query.filter('question_collection', 'ov', collectionsArray)
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


export interface QuestionSummary {
  id: string
  categories: QuestionCategory[]
  difficulty: number
  questionCollection: QuestionCollection[]
}

/**
 * Get minimal question data for distribution analysis
 */
export async function getQuestionSummaries(collections?: QuestionCollection[]): Promise<QuestionSummary[]> {
  let query = supabase
    .from('questions')
    .select('id, categories, difficulty, question_collection')

  if (collections && collections.length > 0 && !collections.includes('__NONE__')) {
    const collectionsArray = `{${collections.map(c => `"${c}"`).join(',')}}`
    query = query.filter('question_collection', 'ov', collectionsArray)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch summaries: ${error.message}`)
  }

  return (data || []).map(row => ({
    id: row.id,
    categories: row.categories as QuestionCategory[],
    difficulty: row.difficulty,
    questionCollection: row.question_collection as QuestionCollection[]
  }))
}
