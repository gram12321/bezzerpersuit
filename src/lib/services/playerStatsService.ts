import { getPlayerStats, createGameSession, updateGameSession, getGameSession, incrementPlayerStats } from '@/database'
import type { PlayerStats, GameSession } from '@/lib/utils'

/**
 * Service for managing player statistics and game sessions
 */

export interface UpdateGameSessionData {
  score?: number
  questionsAnswered?: number
}

class PlayerStatsService {
  /**
   * Get player statistics
   */
  public async getStats(userId: string): Promise<PlayerStats | null> {
    const data = await getPlayerStats(userId)
    if (!data) return null

    return {
      id: data.id,
      userId: data.user_id,
      questionsAnswered: data.questions_answered,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers
    }
  }

  /**
   * Create a new game session
   */
  public async createSession(userId: string): Promise<GameSession | null> {
    const data = await createGameSession(userId)
    if (!data) return null

    return ({
      id: data.id,
      userId: data.user_id || '', // Now guaranteed to be string if DB schema enforces it, or we handle empty string
      score: data.score,
      questionsAnswered: data.questions_answered
    })
  }

  /**
   * Update an existing game session
   */
  public async updateSession(sessionId: string, updates: UpdateGameSessionData): Promise<boolean> {
    const result = await updateGameSession(sessionId, updates)
    return result.success
  }

  /**
   * Get game session by ID
   */
  public async getSession(sessionId: string): Promise<GameSession | null> {
    const data = await getGameSession(sessionId)
    if (!data) return null

    return ({
      id: data.id,
      userId: data.user_id || '', // Ensure it's a string
      score: data.score,
      questionsAnswered: data.questions_answered
    })
  }

  /**
   * Calculate accuracy percentage
   */
  public calculateAccuracy(stats: PlayerStats): number {
    if (stats.questionsAnswered === 0) return 0
    return Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
  }
  /**
   * Update player stats (increment counts)
   */
  public async updateStats(userId: string, wasCorrect: boolean): Promise<boolean> {
    const result = await incrementPlayerStats(userId, wasCorrect)
    return result.success
  }
}

export const playerStatsService = new PlayerStatsService()
