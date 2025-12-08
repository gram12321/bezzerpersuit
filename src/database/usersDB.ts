import { supabase } from './supabase'

/**
 * Database layer for user profile operations
 * All CRUD operations for users table
 */

interface UserData {
  id: string
  username: string
  avatar_id?: string
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
