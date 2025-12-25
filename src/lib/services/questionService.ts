import type { Question, QuestionCategory, Player, QuestionCollection } from '@/lib/utils'
import { getQuestionDifficultyById, updateQuestionDifficultyById, getAllQuestions, getQuestionStats, updateQuestionStats, incrementQuestionSpoiler, getQuestionSpoilers } from '@/database'
import { calculateAdaptiveDifficulty } from './adaptiveDifficulty'
import { getHumanPlayers } from './scoringService'

/**
 * Wraps a promise with a timeout. If the promise doesn't resolve within the timeout,
 * rejects with a timeout error.
 * 
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Error message to use if timeout occurs
 */
function promiseWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ])
}

export async function fetchRandomQuestions(
  count: number = 8,
  category?: QuestionCategory,
  targetDifficulty?: number,
  userIds?: string[],
  turnPlayerUserId?: string,
  collections?: QuestionCollection[]  // Filter by collections (empty = all)
): Promise<Question[]> {
  try {
    // Debug: log inputs (minimal)
    console.log('[fetchRandomQuestions] start', { count, category, targetDifficulty, collections })

    // 1. Fetch questions: Start with category + collections, then fallback if empty.
    // We want a pool that is as broad as necessary to never be empty, but as specific as possible.
    let allQuestions: Question[] = []
    const fetchStart = Date.now()

    // watchdog to signal if the DB call is hanging
    const watchdogMs = 3000
    let watchdogFired = false
    const watchdog = setTimeout(() => {
      watchdogFired = true
      console.warn('[fetchRandomQuestions] DB fetch taking unusually long (>3s)', { dbMethod: 'getAllQuestions' })
    }, watchdogMs)

    // 1. Fetch the absolute pool of questions.
    // We shift filtering logic to the local tier-system to allow fallbacks between 
    // categories and collections without multiple database round-trips.
    try {
      allQuestions = await getAllQuestions()
    } catch (err) {
      clearTimeout(watchdog)
      console.error('[fetchRandomQuestions] Database fetch failed', { error: err })
      throw err
    }
    clearTimeout(watchdog)
    const fetchElapsed = Date.now() - fetchStart
    if (watchdogFired) console.info('[fetchRandomQuestions] DB fetch eventually returned', { fetchMs: fetchElapsed })

    if (!allQuestions || allQuestions.length === 0) {
      console.error('[fetchRandomQuestions] No questions found in database at all.')
      throw new Error('No questions available in the database.')
    }

    console.log('[fetchRandomQuestions] allQuestions fetched pool size', { total: allQuestions.length, fetchMs: fetchElapsed })

    // Compute requested difficulty and immediate availability
    const difficulty = targetDifficulty ?? 0.5
    const tier1Tol = 0.05

    // Check initial availability for the "Ideal" scenario
    const inIdeal = allQuestions.filter(q =>
      (category && q.categories.includes(category)) &&
      (collections && collections.length > 0 ? q.questionCollection.some(c => collections.includes(c)) : true) &&
      Math.abs(q.difficulty - difficulty) <= tier1Tol
    )

    console.log('[fetchRandomQuestions] ideal availability (Cat+Coll+IdealDiff)', {
      totalPool: allQuestions.length,
      requestedCategory: category,
      requestedCollections: collections,
      requestedDifficulty: Number(difficulty.toFixed(2)),
      idealMatchCount: inIdeal.length
    })

    // If no users provided (no spoiler tracking needed), use simplified fallback logic
    if (!userIds || userIds.length === 0) {
      const inColl = collections && collections.length > 0
        ? allQuestions.filter(q => q.questionCollection.some(c => collections.includes(c)))
        : allQuestions

      const inCat = category ? inColl.filter(q => q.categories.includes(category)) : inColl
      const inDiff = inCat.filter(q => Math.abs(q.difficulty - difficulty) <= 0.3)

      const candidates = inDiff.length > 0 ? inDiff : (inCat.length > 0 ? inCat : (inColl.length > 0 ? inColl : allQuestions))
      const shuffled = [...candidates].sort(() => Math.random() - 0.5)
      const result = shuffled.slice(0, Math.min(count, candidates.length))

      console.log('[fetchRandomQuestions] no userIds branch results', {
        inCollCount: inColl.length,
        inCatCount: inCat.length,
        candidatesCount: candidates.length,
        returnedCount: result.length
      })

      return result
    }

    // Fetch spoiler values for all users with timeout protection
    const questionIds = allQuestions.map(q => q.id)
    const SPOILER_FETCH_TIMEOUT_MS = 5000 // 5 second timeout

    const userSpoilers = await Promise.all(
      userIds.map(async userId => {
        try {
          // Wrap spoiler fetch with timeout to prevent infinite hangs
          const spoilers = await promiseWithTimeout(
            getQuestionSpoilers(userId, questionIds),
            SPOILER_FETCH_TIMEOUT_MS,
            `Spoiler fetch timeout for user ${userId}`
          )
          return spoilers
        } catch (error) {
          // Check if this was a timeout error
          if (error instanceof Error && error.message.includes('timeout')) {
            console.warn(`[fetchRandomQuestions] Spoiler fetch timed out for user ${userId} after ${SPOILER_FETCH_TIMEOUT_MS}ms - continuing with no spoiler data`)
          } else {
            console.error(`[fetchRandomQuestions] Failed to get spoilers for user ${userId}:`, error)
          }
          return {} // Return empty object on error or timeout
        }
      })
    )

    // (suppressed) spoilers fetched log removed to reduce verbosity

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

    // Compute per-question diagnostics: distance from target and spoiler value
    const questionsDiagnostics = questionsWithSpoilers.map(q => ({
      id: q.id,
      categories: q.categories,
      questionCollections: q.questionCollection,
      difficulty: q.difficulty,
      distance: Math.abs(q.difficulty - difficulty),
      combinedSpoiler: q.combinedSpoiler
    }))

    // Priority Tiers: [difficultyTolerance, maxSpoiler, categoryRequired, collectionRequired]
    const tiers: Array<[number, number | null, boolean, boolean]> = [
      // 1-4: Category Match, Ideal Difficulty, low/no spoilers
      [0.05, 0, true, true], [0.05, 0.5, true, true], [0.1, 0.5, true, true], [0.1, 1.0, true, true],

      // 5-8: Category Match, Medium Difficulty Range, low spoilers
      [0.15, 0.5, true, true], [0.15, 1.0, true, true], [0.2, 1.0, true, true], [0.25, 1.0, true, true],

      // 9-12: Category Match, Medium Difficulty, Medium spoilers
      [0.15, 2.0, true, true], [0.20, 2.0, true, true], [0.25, 2.0, true, true], [0.30, 2.0, true, true],

      // 13-14: Category Match, High Difficulty, Medium spoilers
      [0.40, 2.0, true, true], [0.50, 2.0, true, true],

      // 15: Category Match, Any Difficulty, Any spoilers
      [1.0, null, true, true],

      // 16-17: Any Category, Ideal Difficulty, low/no spoilers
      [0.05, 0.5, false, true], [0.1, 0.5, false, true],

      // 18: Any Category, low Difficulty, low/no spoilers
      [0.15, 0.5, false, true],

      // 19: Any Category, medium Difficulty, low spoilers
      [0.2, 1.0, false, true],

      // 20-21: Any Category, medium Difficulty, medium spoilers
      [0.2, 2.0, false, true], [0.3, 2.0, false, true],

      // 22: Any Category, any Difficulty, medium spoilers
      [1.0, 2.0, false, true],

      // 23: Any Category, any Difficulty, any spoilers (Still respecting Collection)
      [1.0, null, false, true],

      // 24: Any Category, any Difficulty, any spoilers (ANY collection / Absolute fallback)
      [1.0, null, false, false],
    ]

    // Prepare diagnostics per tier (includes evaluation accepted: boolean per question)
    const perTierDiagnostics = tiers.map(([diffTolerance, maxSpoiler, categoryRequired, collectionRequired], tierIndex) => {
      const evaluated = questionsDiagnostics.map(q => {
        const catMatch = !categoryRequired || (category && q.categories.includes(category))
        const collMatch = !collectionRequired || (collections && collections.length > 0 ? q.questionCollections.some(c => collections.includes(c)) : true)
        const diffMatch = q.distance <= diffTolerance
        const spoilerMatch = maxSpoiler === null || q.combinedSpoiler <= maxSpoiler
        return {
          id: q.id,
          difficulty: q.difficulty,
          distance: q.distance,
          combinedSpoiler: q.combinedSpoiler,
          accepted: !!(catMatch && collMatch && diffMatch && spoilerMatch)
        }
      })

      // Sort evaluated by ascending distance
      evaluated.sort((a, b) => a.distance - b.distance)

      const acceptedCount = evaluated.filter(e => e.accepted).length
      return {
        tierIndex,
        diffTolerance,
        maxSpoiler,
        categoryRequired,
        collectionRequired,
        acceptedCount,
        evaluated
      }
    })

    // Log a compact, structured summary desired by caller
    console.log('[fetchRandomQuestions] selection hierarchy summary', {
      totalPool: allQuestions.length,
      requestedDifficulty: difficulty,
      requestedCategory: category,
      requestedCollections: collections,
      perTier: perTierDiagnostics.map(t => ({
        index: t.tierIndex,
        diffTol: t.diffTolerance,
        maxSp: t.maxSpoiler,
        catReq: t.categoryRequired,
        collReq: t.collectionRequired,
        results: t.acceptedCount
      }))
    })

    // Also log per-tier full evaluations for deep debugging
    console.log('[fetchRandomQuestions] perTierEvaluations', perTierDiagnostics.map(t => ({
      tier: t.tierIndex,
      count: t.acceptedCount,
      evaluated: t.evaluated
    })))

    // Now iterate tiers to actually select a candidate
    for (let i = 0; i < tiers.length; i++) {
      const [diffTolerance, maxSpoiler, categoryRequired, collectionRequired] = tiers[i]
      const candidates = questionsWithSpoilers.filter(q => {
        const catMatch = !categoryRequired || (category && q.categories.includes(category))
        const collMatch = !collectionRequired || (collections && collections.length > 0 ? q.questionCollection.some(c => collections.includes(c)) : true)
        const diffMatch = Math.abs(q.difficulty - difficulty) <= diffTolerance
        const spoilerMatch = maxSpoiler === null || q.combinedSpoiler <= maxSpoiler
        return catMatch && collMatch && diffMatch && spoilerMatch
      })

      if (candidates.length > 0) {
        const shuffled = [...candidates].sort(() => Math.random() - 0.5)
        const result = shuffled.slice(0, Math.min(count, candidates.length))
        console.log('[fetchRandomQuestions] selected from tier', {
          tierIndex: i,
          returnedCount: result.length,
          catReq: categoryRequired,
          collReq: collectionRequired
        })
        return result
      }
    }

    // Absolute fallback - should only happen if database is fundamentally empty
    console.warn('[fetchRandomQuestions] No candidates matched ANY tier. Returning random pool items.')
    const finalShuffled = [...questionsWithSpoilers].sort(() => Math.random() - 0.5)
    return finalShuffled.slice(0, Math.min(count, questionsWithSpoilers.length))

  } catch (error) {
    console.error('[fetchRandomQuestions] Error fetching random questions:', error)
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
