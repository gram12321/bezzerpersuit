import type { Question, QuestionCategory, Player } from '@/lib/utils'
import { getQuestionsWithFilters, getQuestionDifficultyById, updateQuestionDifficultyById, getAllQuestions, getQuestionStats, updateQuestionStats, incrementQuestionSpoiler, getQuestionSpoilers } from '@/database'
import { calculateAdaptiveDifficulty } from './adaptiveDifficulty'
import { getHumanPlayers } from './scoringService'

export async function fetchRandomQuestions(
  count: number = 8,
  category?: QuestionCategory,
  targetDifficulty?: number,
  userIds?: string[],
  turnPlayerUserId?: string
): Promise<Question[]> {
  try {
    // Debug: log inputs
    console.log('[fetchRandomQuestions] start', {
      count,
      category,
      targetDifficulty,
      userIdsCount: userIds?.length || 0,
      turnPlayerUserId
    })

    // Get all potential questions in category (or all questions if no category)
    const allQuestions = category 
      ? await getQuestionsWithFilters({ category })
      : await getAllQuestions()

    console.log('[fetchRandomQuestions] allQuestions fetched', {
      total: allQuestions.length,
      sampleIds: allQuestions.slice(0, 8).map(q => q.id)
    })

    // Log full candidate list (id + difficulty) for inspection
    try {
      console.log('[fetchRandomQuestions] allQuestions details', allQuestions.map(q => ({ id: q.id, difficulty: q.difficulty })))
    } catch (e) {
      /* ignore logging errors */
    }

    if (allQuestions.length === 0) {
      console.error('[fetchRandomQuestions] No questions available in the database for category', category)
      throw new Error('No questions available in the database.')
    }

    const difficulty = targetDifficulty ?? 0.5

    // If no users provided, use simple filtering without spoilers
    if (!userIds || userIds.length === 0) {
      // simple no-user spoiler path
      const filtered = allQuestions.filter(q => 
        Math.abs(q.difficulty - difficulty) <= 0.5
      )
      const candidates = filtered.length > 0 ? filtered : allQuestions
      const shuffled = [...candidates].sort(() => Math.random() - 0.5)
      const result = shuffled.slice(0, Math.min(count, candidates.length))

      console.log('[fetchRandomQuestions] no userIds branch', {
        difficulty,
        filteredCount: filtered.length,
        candidatesCount: candidates.length,
        returnedCount: result.length
      })

      return result
    }

    // Fetch spoiler values for all users
    const questionIds = allQuestions.map(q => q.id)
    const userSpoilers = await Promise.all(
      userIds.map(async userId => {
        try {
          return await getQuestionSpoilers(userId, questionIds)
        } catch (error) {
          console.error(`Failed to get spoilers for user ${userId}:`, error)
          return {} // Return empty object on error
        }
      })
    )

    console.log('[fetchRandomQuestions] userSpoilers fetched', {
      questionIdsCount: questionIds.length,
      users: userIds,
      userSpoilersSample: userSpoilers.slice(0, 3)
    })

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

    // Log spoiler distribution
    if (questionsWithSpoilers.length > 0) {
      const spoilers = questionsWithSpoilers.map(q => q.combinedSpoiler)
      const min = Math.min(...spoilers)
      const max = Math.max(...spoilers)
      const avg = spoilers.reduce((s, v) => s + v, 0) / spoilers.length
      console.log('[fetchRandomQuestions] spoiler stats', { min, max, avg })
    }

    // Debug: counts of questions within difficulty ranges and how many have zero spoiler
    const ranges = [0.05, 0.1, 0.15, 0.2]
    const rangeStats = ranges.map(r => {
      const inRange = questionsWithSpoilers.filter(q => Math.abs(q.difficulty - difficulty) <= r)
      const zeroSpoiler = inRange.filter(q => q.combinedSpoiler === 0).length
      return { range: r, total: inRange.length, zeroSpoiler }
    })
    console.log('[fetchRandomQuestions] difficulty range stats', { target: difficulty, rangeStats })

    // Also log exact entries within narrow ranges for verification
    const narrow = questionsWithSpoilers.filter(q => Math.abs(q.difficulty - difficulty) <= 0.05)
    console.log('[fetchRandomQuestions] entries within ±0.05', narrow.map(q => ({ id: q.id, difficulty: q.difficulty, combinedSpoiler: q.combinedSpoiler })))

    const slightlyWider = questionsWithSpoilers.filter(q => Math.abs(q.difficulty - difficulty) <= 0.1)
    console.log('[fetchRandomQuestions] entries within ±0.1', slightlyWider.map(q => ({ id: q.id, difficulty: q.difficulty, combinedSpoiler: q.combinedSpoiler })))

    // Define priority tiers: [difficultyTolerance, maxSpoiler]
    // Note: selectedDifficulty is the midpoint, we query with ±0.05 range (matching the 0.1 difficulty brackets)
    // Example: "Easy Pickings" = 0.15 midpoint → 0.1-0.2 range
    const tiers: Array<[number, number | null]> = [
      [0.05, 0],     // 1. Within selected range (±0.05), no spoiler
      [0.05, 0.5],   // 2. Within selected range (±0.05), spoiler ≤ 0.5
      [0.1, 0],      // 3. Within ±0.1 (one bracket wider), no spoiler
      [0.1, 0.5],    // 4. Within ±0.1, spoiler ≤ 0.5
      [0.15, 0],     // 5. Within ±0.15 (two brackets wider), no spoiler
      [0.05, 1.0],   // 6. Within selected range, spoiler ≤ 1.0
      [0.1, 1.0],    // 7. Within ±0.1, spoiler ≤ 1.0
      [0.15, 1.0],   // 8. Within ±0.15, spoiler ≤ 1.0
      [0.2, 1.0],    // 9. Within ±0.2, spoiler ≤ 1.0
      [0.05, 1.5],   // 10. Within selected range, spoiler ≤ 1.5
      [0.1, 1.5],    // 11. Within ±0.1, spoiler ≤ 1.5
      [0.15, 1.5],   // 12. Within ±0.15, spoiler ≤ 1.5
      [0.2, 1.5],    // 13. Within ±0.2, spoiler ≤ 1.5
      [0.05, 2.0],   // 14. Within selected range, spoiler ≤ 2.0
      [0.1, 2.0],    // 15. Within ±0.1, spoiler ≤ 2.0
      [0.15, 2.0],   // 16. Within ±0.15, spoiler ≤ 2.0
      [0.2, 2.0],    // 17. Within ±0.2, spoiler ≤ 2.0
      [0.3, 2.0],    // 18. Within ±0.3, spoiler ≤ 2.0
      [0.05, null],  // 19. Within selected range, any spoiler
      [0.1, null],   // 20. Within ±0.1, any spoiler
      [0.2, null],   // 21. Within ±0.2, any spoiler
      [0.3, null],   // 22. Within ±0.3, any spoiler
      [1.0, null],   // 23. Any difficulty in category, any spoiler
    ]

    // Try each tier
    for (let i = 0; i < tiers.length; i++) {
      const [diffTolerance, maxSpoiler] = tiers[i]
      const candidates = questionsWithSpoilers.filter(q => {
        // Check difficulty
        const diffMatch = Math.abs(q.difficulty - difficulty) <= diffTolerance
        
        // Check spoiler
        const spoilerMatch = maxSpoiler === null || q.combinedSpoiler <= maxSpoiler
        
        return diffMatch && spoilerMatch
      })

      console.log('[fetchRandomQuestions] tier check', {
        tierIndex: i,
        diffTolerance,
        maxSpoiler,
        candidates: candidates.length
      })

      if (candidates.length > 0) {
        // Random selection within tier
        const shuffled = [...candidates].sort(() => Math.random() - 0.5)
        const result = shuffled.slice(0, Math.min(count, candidates.length))
        console.log('[fetchRandomQuestions] selected from tier', { tierIndex: i, returned: result.length })
        return result
      }
    }

    // If we reached here with category filter, we found questions in category but none matched tiers
    // This means all questions have been seen too much - just return them anyway (ignore spoilers)
    console.warn('[fetchRandomQuestions] no candidates matched any tier — falling back to ignoring spoilers')
    console.log('[fetchRandomQuestions] questionsWithSpoilers sample', questionsWithSpoilers.slice(0, 10).map(q => ({ id: q.id, difficulty: q.difficulty, combinedSpoiler: q.combinedSpoiler })))
    const shuffled = [...questionsWithSpoilers].sort(() => Math.random() - 0.5)
    const result = shuffled.slice(0, Math.min(count, questionsWithSpoilers.length))
    console.log('[fetchRandomQuestions] fallback returned', { returned: result.length })
    return result

  } catch (error) {
    // ...existing code...
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
