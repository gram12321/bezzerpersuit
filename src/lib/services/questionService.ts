import type { Question, QuestionCategory, Player } from '@/lib/utils/types'
import { getQuestionsWithFilters, getQuestionDifficultyById, updateQuestionDifficultyById, getAllQuestions, getQuestionStats, updateQuestionStats } from '@/database'
import { calculateAdaptiveDifficulty } from './adaptiveDifficulty'
import { getHumanPlayers } from './scoringService'

export async function fetchRandomQuestions(
  count: number = 8,
  category?: QuestionCategory,
  minDifficulty?: number,
  maxDifficulty?: number
): Promise<Question[]> {
  try {
    // Try to get questions with exact criteria
    let questions = await getQuestionsWithFilters({
      category,
      minDifficulty,
      maxDifficulty
    })

    // Fallback strategy 1: if no exact matches, find nearest difficulty in same category
    if (questions.length === 0 && category) {
      // Get all questions in the category (without difficulty filter)
      const categoryQuestions = await getQuestionsWithFilters({
        category,
        // No difficulty filters
      })
      
      if (categoryQuestions.length > 0) {
        // Calculate target difficulty (midpoint of range)
        const targetDifficulty = minDifficulty !== undefined && maxDifficulty !== undefined
          ? (minDifficulty + maxDifficulty) / 2
          : 0.5

        // Sort by distance from target difficulty
        const sortedByNearest = categoryQuestions.sort((a, b) => {
          const distA = Math.abs(a.difficulty - targetDifficulty)
          const distB = Math.abs(b.difficulty - targetDifficulty)
          return distA - distB
        })

        questions = sortedByNearest
        
        const selectedQuestions = questions.slice(0, Math.min(count, questions.length))
        const diffRange = selectedQuestions.length > 0 
          ? `${selectedQuestions[0].difficulty.toFixed(2)}-${selectedQuestions[selectedQuestions.length - 1].difficulty.toFixed(2)}`
          : 'N/A'
        
        console.warn(`⚠️ FALLBACK: No exact match for "${category}" at difficulty ${minDifficulty?.toFixed(2)}-${maxDifficulty?.toFixed(2)}`)
        console.warn(`   → Using ${selectedQuestions.length} questions from "${category}" with nearest difficulty: ${diffRange}`)
      }
    }

    // Fallback strategy 2: if still no questions, use ANY questions (ignore category)
    if (questions.length === 0) {
      const allQuestions = await getAllQuestions()
      
      if (allQuestions.length === 0) {
        throw new Error('No questions available in the database. Please add questions to continue.')
      }

      // Calculate target difficulty
      const targetDifficulty = minDifficulty !== undefined && maxDifficulty !== undefined
        ? (minDifficulty + maxDifficulty) / 2
        : 0.5

      // Sort by distance from target difficulty
      questions = allQuestions.sort((a, b) => {
        const distA = Math.abs(a.difficulty - targetDifficulty)
        const distB = Math.abs(b.difficulty - targetDifficulty)
        return distA - distB
      })
      
      const selectedQuestions = questions.slice(0, Math.min(count, questions.length))
      const categoriesUsed = [...new Set(selectedQuestions.flatMap(q => q.categories))].join(', ')
      const diffRange = selectedQuestions.length > 0
        ? `${selectedQuestions[0].difficulty.toFixed(2)}-${selectedQuestions[selectedQuestions.length - 1].difficulty.toFixed(2)}`
        : 'N/A'
      
      console.warn(`⚠️ FALLBACK: No questions found in "${category}"`)
      console.warn(`   → Using ${selectedQuestions.length} questions from ANY category: ${categoriesUsed}`)
      console.warn(`   → Difficulty range: ${diffRange} (target: ${targetDifficulty.toFixed(2)})`)
    }

    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(count, questions.length))
    
    return selected
  } catch (error) {
    console.error('❌ Error in fetchRandomQuestions:', error)
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

/**
 * Update question stats and adaptive difficulty based on human player performance
 * Excludes AI players from difficulty calculations
 * 
 * @param question - The question that was answered
 * @param players - All players with their answers
 */
export async function updateQuestionStatsFromPlayers(
  question: Question,
  players: Player[]
): Promise<void> {
  try {
    const humanPlayers = getHumanPlayers(players)
    
    if (humanPlayers.length === 0) {
      // No human players, don't update difficulty
      return
    }

    const humanCorrect = humanPlayers.filter(
      p => p.selectedAnswer === question.correctAnswerIndex
    ).length
    const humanIncorrect = humanPlayers.length - humanCorrect

    // Get current stats
    const stats = await getQuestionStats(question.id)

    // Calculate new difficulty using adaptive algorithm
    const update = calculateAdaptiveDifficulty(
      stats.difficulty,
      {
        correct_count: stats.correct_count,
        incorrect_count: stats.incorrect_count,
        recent_history: stats.recent_history
      },
      humanCorrect,
      humanIncorrect
    )

    // Update counts and history
    const newCorrectCount = stats.correct_count + humanCorrect
    const newIncorrectCount = stats.incorrect_count + humanIncorrect
    const newHistory = [
      ...stats.recent_history,
      ...Array(humanCorrect).fill(true),
      ...Array(humanIncorrect).fill(false)
    ].slice(-10) // Keep last 10 results

    await updateQuestionStats(
      question.id,
      update.newDifficulty,
      newCorrectCount,
      newIncorrectCount,
      newHistory
    )
  } catch (error) {
    console.error('Failed to update question stats:', error)
    // Don't throw - this is a non-critical operation
  }
}
