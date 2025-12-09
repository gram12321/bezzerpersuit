import { supabase } from '@/database/supabase'
import { getUserById, updateUser, checkUsernameExists } from '@/database'
import type { User } from '@/lib/utils'

/**
 * Simple authentication service wrapper for Supabase Auth
 * Handles sign up, sign in, OAuth, and session management
 */

export interface SignUpData {
  username: string
  password: string
}

export interface SignInData {
  username: string
  password: string
}

export interface AuthResult {
  success: boolean
  error?: string
}

class AuthService {
  private currentUser: User | null = null
  private listeners: ((user: User | null) => void)[] = []

  constructor() {
    this.initializeAuth()
  }

  /**
   * Initialize auth state and listen for changes
   */
  private async initializeAuth() {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await this.loadUserProfile(session.user.id)
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        this.setCurrentUser(null)
      }
    })
  }

  /**
   * Load user profile from database
   */
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const data = await getUserById(userId)

      if (data) {
        this.setCurrentUser({
          id: data.id,
          username: data.username,
          avatarId: data.avatar_id
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  /**
   * Set current user and notify listeners
   */
  private setCurrentUser(user: User | null) {
    this.currentUser = user
    this.notifyListeners()
  }

  /**
   * Notify all auth state listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser))
  }

  /**
   * Subscribe to auth state changes
   * Returns unsubscribe function
   */
  public onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback)
    // Call immediately with current state
    callback(this.currentUser)

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  /**
   * Sign up with username and password
   */
  public async signUp({ username, password }: SignUpData): Promise<AuthResult> {
    try {
      // Check if username is already taken
      const usernameExists = await checkUsernameExists(username)
      if (usernameExists) {
        return { success: false, error: 'Username already taken' }
      }

      // Generate email from username for Supabase auth (internal only)
      const email = `${username}@bezzerpersuit.local`

      // Create auth user with metadata (trigger will create profile)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })

      if (authError) {
        // Provide more helpful error messages
        if (authError.message.toLowerCase().includes('password')) {
          return { success: false, error: 'Password must be at least 6 characters long' }
        }
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' }
      }

      return { success: true }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign in with username and password
   */
  public async signIn({ username, password }: SignInData): Promise<AuthResult> {
    try {
      // Convert username to email format for Supabase auth
      const email = `${username}@bezzerpersuit.local`

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        return { success: true }
      }

      return { success: false, error: 'Failed to sign in' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }



  /**
   * Sign in with Google OAuth
   */
  public async signInWithGoogle(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // OAuth will redirect, so this is just to handle the redirect
      return { success: true }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign out current user
   */
  public async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update user profile
   */
  public async updateProfile(updates: Partial<Pick<User, 'username' | 'avatarId'>>): Promise<AuthResult> {
    if (!this.currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const updateData: any = {}
      if (updates.username !== undefined) updateData.username = updates.username
      if (updates.avatarId !== undefined) updateData.avatar_id = updates.avatarId

      const result = await updateUser(this.currentUser.id, updateData)

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to update profile' }
      }

      // Reload user profile
      await this.loadUserProfile(this.currentUser.id)
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}

export const authService = new AuthService()
