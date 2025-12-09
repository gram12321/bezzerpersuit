import { supabase } from './supabase'

/**
 * Database layer for player statistics operations
 * All CRUD operations for player_stats and game_sessions tables
 */

interface PlayerStatsData {
  id: string
  user_id: string
  questions_answered: number
  correct_answers: number
  incorrect_answers: number
}

interface GameSessionData {
  id: string
  user_id?: string
  score: number
  questions_answered: number
}

/**
 * Get player stats by user ID
 */
export async function getPlayerStats(userId: string): Promise<PlayerStatsData | null> {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error getting player stats:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting player stats:', error)
    return null
  }
}

/**
 * Create a game session
 */
export async function createGameSession(userId?: string): Promise<GameSessionData | null> {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating game session:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating game session:', error)
    return null
  }
}

/**
 * Update a game session
 */
export async function updateGameSession(
  sessionId: string,
  updates: Partial<Omit<GameSessionData, 'id' | 'user_id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', sessionId)

    if (error) {
      console.error('Error updating game session:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating game session:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get a game session by ID
 */
export async function getGameSession(sessionId: string): Promise<GameSessionData | null> {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error('Error getting game session:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting game session:', error)
    return null
  }
}

/**
 * Update player stats from a completed game session
 * Calls the database function
 */
export async function updatePlayerStatsFromSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('update_player_stats_from_session', {
      session_id: sessionId
    })

    if (error) {
      console.error('Error updating stats from session:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating stats from session:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Update player stats directly (increment counts)
 */
export async function incrementPlayerStats(
  userId: string,
  wasCorrect: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get current stats
    const currentStats = await getPlayerStats(userId)

    // If stats don't exist, create them
    if (!currentStats) {
      const { error } = await supabase
        .from('player_stats')
        .insert({
          user_id: userId,
          questions_answered: 1,
          correct_answers: wasCorrect ? 1 : 0,
          incorrect_answers: wasCorrect ? 0 : 1
        })

      if (error) {
        console.error('Error creating player stats:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    }

    const updates = {
      questions_answered: (currentStats.questions_answered || 0) + 1,
      correct_answers: (currentStats.correct_answers || 0) + (wasCorrect ? 1 : 0),
      incorrect_answers: (currentStats.incorrect_answers || 0) + (wasCorrect ? 0 : 1)
    }

    const { error } = await supabase
      .from('player_stats')
      .update(updates)
      .eq('user_id', userId)

    if (error) {
      console.error('Error incrementing player stats:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error incrementing player stats:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
