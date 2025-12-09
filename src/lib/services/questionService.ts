import type { Question, QuestionCategory, Player } from '@/lib/utils'
import { getQuestionsWithFilters, getQuestionDifficultyById, updateQuestionDifficultyById, getAllQuestions, getQuestionStats, updateQuestionStats, incrementQuestionSpoiler, getQuestionSpoilers } from '@/database'
import { calculateAdaptiveDifficulty } from './adaptiveDifficulty'
import { getHumanPlayers } from './scoringService'

export async function fetchRandomQuestions(
  count: number = 8,
  category?: QuestionCategory,
  minDifficulty?: number,
  maxDifficulty?: number,
  userIds?: string[],
  turnPlayerUserId?: string
): Promise<Question[]> {
  try {
    // Get all potential questions in category (or all questions if no category)
    const allQuestions = category 
      ? await getQuestionsWithFilters({ category })
      : await getAllQuestions()

    if (allQuestions.length === 0) {
      throw new Error('No questions available in the database.')
    }

    const targetDifficulty = minDifficulty !== undefined && maxDifficulty !== undefined
      ? (minDifficulty + maxDifficulty) / 2
      : 0.5

    // If no users provided, use simple filtering without spoilers
    if (!userIds || userIds.length === 0) {
      const filtered = allQuestions.filter(q => 
        Math.abs(q.difficulty - targetDifficulty) <= 0.5
      )
      const candidates = filtered.length > 0 ? filtered : allQuestions
      const shuffled = [...candidates].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, Math.min(count, candidates.length))
    }

    // Fetch spoiler values for all users
    const questionIds = allQuestions.map(q => q.id)
    const userSpoilers = await Promise.all(
      userIds.map(userId => getQuestionSpoilers(userId, questionIds))
    )

    // Calculate combined spoiler value for each question
    type QuestionWithSpoiler = Question & { combinedSpoiler: number }
    const questionsWithSpoilers: QuestionWithSpoiler[] = allQuestions.map(q => {
      let combinedSpoiler = 0
      
      // Add each user's spoiler value
      for (let i = 0; i < userIds.length; i++) {
        const spoilerValue = userSpoilers[i][q.id] || 0
        
        // Double the turn player's spoiler value
        if (userIds[i] === turnPlayerUserId) {
          combinedSpoiler += spoilerValue * 2
        } else {
          combinedSpoiler += spoilerValue
        }
      }
      
      return { ...q, combinedSpoiler }
    })

    // Define priority tiers: [difficultyTolerance, maxSpoiler]
    // Each tier will try progressively more relaxed criteria
    const tiers: Array<[number, number | null]> = [
      [0, 0],       // 1. Exact difficulty, no spoiler
      [0.1, 0],     // 2. ±0.1 difficulty, no spoiler
      [0, 0.5],     // 3. Exact difficulty, spoiler ≤ 0.5
      [0.1, 0.5],   // 4. ±0.1 difficulty, spoiler ≤ 0.5
      [0.2, 0.5],   // 5. ±0.2 difficulty, spoiler ≤ 0.5
      [0, 1.0],     // 6. Exact difficulty, spoiler ≤ 1.0
      [0.1, 1.0],   // 7. ±0.1 difficulty, spoiler ≤ 1.0
      [0.2, 1.0],   // 8. ±0.2 difficulty, spoiler ≤ 1.0
      [0.3, 1.0],   // 9. ±0.3 difficulty, spoiler ≤ 1.0
      [0, 1.5],     // 10. Exact difficulty, spoiler ≤ 1.5
      [0.1, 1.5],   // 11. ±0.1 difficulty, spoiler ≤ 1.5
      [0.2, 1.5],   // 12. ±0.2 difficulty, spoiler ≤ 1.5
      [0.3, 1.5],   // 13. ±0.3 difficulty, spoiler ≤ 1.5
      [0.4, 1.5],   // 14. ±0.4 difficulty, spoiler ≤ 1.5
      [0, 2.0],     // 15. Exact difficulty, spoiler ≤ 2.0
      [0.1, 2.0],   // 16. ±0.1 difficulty, spoiler ≤ 2.0
      [0.2, 2.0],   // 17. ±0.2 difficulty, spoiler ≤ 2.0
      [0.3, 2.0],   // 18. ±0.3 difficulty, spoiler ≤ 2.0
      [0.4, 2.0],   // 19. ±0.4 difficulty, spoiler ≤ 2.0
      [0.5, 2.0],   // 20. ±0.5 difficulty, spoiler ≤ 2.0
      [0, null],    // 21. Exact difficulty, any spoiler
      [0.1, null],  // 22. ±0.1 difficulty, any spoiler
      [0.2, null],  // 23. ±0.2 difficulty, any spoiler
      [0.3, null],  // 24. ±0.3 difficulty, any spoiler
      [0.5, null],  // 25. ±0.5 difficulty, any spoiler
      [1.0, null],  // 26. Any difficulty in category, any spoiler
    ]

    // Try each tier
    for (const [diffTolerance, maxSpoiler] of tiers) {
      const candidates = questionsWithSpoilers.filter(q => {
        // Check difficulty
        const diffMatch = Math.abs(q.difficulty - targetDifficulty) <= diffTolerance
        
        // Check spoiler
        const spoilerMatch = maxSpoiler === null || q.combinedSpoiler <= maxSpoiler
        
        return diffMatch && spoilerMatch
      })

      if (candidates.length > 0) {
        // Random selection within tier
        const shuffled = [...candidates].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, Math.min(count, candidates.length))
      }
    }

    // Final fallback: any category, any difficulty, any spoiler
    // TODO: In the future, implement category similarity matching before falling back to ANY category
    console.warn(`⚠️ FALLBACK: No suitable questions found in "${category}" - using ANY category`)
    
    const allQuestionsAnyCategory = await getAllQuestions()
    if (allQuestionsAnyCategory.length === 0) {
      throw new Error('No questions available in the database.')
    }
    
    const shuffled = [...allQuestionsAnyCategory].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, allQuestionsAnyCategory.length))

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

/**
 * Track question spoiler values for authenticated players
 * +0.5 for seeing the question, +1 for answering correctly
 * 
 * @param question - The question that was shown
 * @param players - All players with their answers
 */
export async function updatePlayerSpoilerValues(
  question: Question,
  players: Player[]
): Promise<void> {
  try {
    const humanPlayers = getHumanPlayers(players)
    
    for (const player of humanPlayers) {
      if (!player.isAI && player.id) {
        // Always increment by 0.5 for seeing the question
        await incrementQuestionSpoiler(player.id, question.id, 0.5)
        
        // Add +1 if they answered correctly
        if (player.selectedAnswer === question.correctAnswerIndex) {
          await incrementQuestionSpoiler(player.id, question.id, 1)
        }
      }
    }
  } catch (error) {
    console.error('Failed to update spoiler values:', error)
    // Don't throw - this is a non-critical operation
  }
}
