import { supabase } from './supabase'

/**
 * Database layer for user profile operations
 * All CRUD operations for users table
 */

interface UserData {
  id: string
  username: string
  avatar_id?: string
  question_spoilers?: Record<string, number>
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserData | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error getting user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Create user profile
 */
export async function createUser(userData: UserData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .insert({
        id: userData.id,
        username: userData.username,
        avatar_id: userData.avatar_id
      })

    if (error) {
      console.error('Error creating user:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<UserData, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Check if username exists
 */
export async function checkUsernameExists(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (error) {
      console.error('Error checking username:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking username:', error)
    return false
  }
}

/**
 * Increment spoiler value for a question
 * +0.5 when shown, +1 when answered correctly
 */
export async function incrementQuestionSpoiler(
  userId: string,
  questionId: string,
  increment: number
): Promise<void> {
  try {
    // Get current spoilers
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('question_spoilers')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching user for spoiler update:', fetchError)
      return
    }

    if (!user) {
      // Logic decision: should we create the user? Probably they should exist if they are playing.
      // But let's fail gracefully if they don't.
      console.warn(`User ${userId} not found when incrementing spoiler`)
      return
    }

    const currentSpoilers = (user?.question_spoilers as Record<string, number>) || {}
    const currentValue = currentSpoilers[questionId] || 0
    const newValue = currentValue + increment

    // Update with new value
    const { error } = await supabase
      .from('users')
      .update({
        question_spoilers: {
          ...currentSpoilers,
          [questionId]: newValue
        }
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating question spoiler:', error)
    }
  } catch (error) {
    console.error('Error incrementing spoiler:', error)
  }
}

/**
 * Get spoiler values for questions
 */
export async function getQuestionSpoilers(
  userId: string,
  questionIds?: string[]
): Promise<Record<string, number>> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('question_spoilers')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching spoilers:', error)
      return {}
    }

    if (!user) {
      // User doesn't exist yet, return empty spoilers
      return {}
    }

    const allSpoilers = (user?.question_spoilers as Record<string, number>) || {}

    if (!questionIds) {
      return allSpoilers
    }

    // Filter to only requested questions
    const filtered: Record<string, number> = {}
    for (const qId of questionIds) {
      if (allSpoilers[qId]) {
        filtered[qId] = allSpoilers[qId]
      }
    }
    return filtered
  } catch (error) {
    console.error('Error getting question spoilers:', error)
    return {}
  }
}
