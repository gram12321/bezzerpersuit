import { getPlayerStats, createGameSession, updateGameSession, getGameSession, updatePlayerStatsFromSession } from '@/database'
import type { PlayerStats, GameSession } from '@/lib/utils/types'

/**
 * Service for managing player statistics and game sessions
 */

export interface UpdateGameSessionData {
  score?: number
  questionsAnswered?: number
  correctAnswers?: number
  incorrectAnswers?: number
  completed?: boolean
  completedAt?: string
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
  public async createSession(userId?: string): Promise<GameSession | null> {
    const data = await createGameSession(userId)
    if (!data) return null

    return {
      id: data.id,
      userId: data.user_id,
      score: data.score,
      questionsAnswered: data.questions_answered,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers,
      completed: data.completed,
      completedAt: data.completed_at
    }
  }

  /**
   * Update an existing game session
   */
  public async updateSession(sessionId: string, updates: UpdateGameSessionData): Promise<boolean> {
    const result = await updateGameSession(sessionId, updates)

    // If session is completed, update player stats
    if (updates.completed && result.success) {
      await updatePlayerStatsFromSession(sessionId)
    }

    return result.success
  }

  /**
   * Get game session by ID
   */
  public async getSession(sessionId: string): Promise<GameSession | null> {
    const data = await getGameSession(sessionId)
    if (!data) return null

    return {
      id: data.id,
      userId: data.user_id,
      score: data.score,
      questionsAnswered: data.questions_answered,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers,
      completed: data.completed,
      completedAt: data.completed_at
    }
  }

  /**
   * Calculate accuracy percentage
   */
  public calculateAccuracy(stats: PlayerStats): number {
    if (stats.questionsAnswered === 0) return 0
    return Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
  }
}

export const playerStatsService = new PlayerStatsService()
