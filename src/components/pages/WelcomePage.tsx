import { useState } from 'react'
import { Lock, User as UserIcon } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { authService } from '@/lib/services'
import type { User } from '@/lib/utils/types'

interface WelcomePageProps {
  user: User | null
  onStartGame: () => void
  onProfile: () => void
  onAdmin: () => void
}

export function WelcomePage({ user, onStartGame, onProfile, onAdmin }: WelcomePageProps) {
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          setError('Username is required')
          setIsLoading(false)
          return
        }

        const result = await authService.signUp({
          username: username.trim(),
          password
        })

        if (result.success) {
          setShowAuthForm(false)
          onStartGame() // Navigate to lobby
        } else {
          setError(result.error || 'Sign up failed')
        }
      } else {
        const result = await authService.signIn({ username: username.trim(), password })

        if (result.success) {
          setShowAuthForm(false)
          onStartGame() // Navigate to lobby
        } else {
          setError(result.error || 'Sign in failed')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setIsLoading(true)

    try {
      const result = await authService.signInWithGoogle()
      if (result.success) {
        onStartGame() // Navigate to lobby
      } else {
        setError(result.error || 'Google sign in failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnonymousSignIn = async () => {
    setShowNicknamePrompt(true)
    setShowAuthForm(false)
  }

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      setError('Please enter a nickname')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const result = await authService.signInAnonymously()
      if (result.success) {
        // Store nickname in sessionStorage for use in lobby/game
        sessionStorage.setItem('guestNickname', nickname.trim())
        setShowNicknamePrompt(false)
        setNickname('')
        onStartGame() // Navigate to lobby
      } else {
        setError(result.error || 'Anonymous sign in failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            Bezzerpersuit
          </h1>
          <p className="text-xl text-purple-200">
            Test your knowledge. Challenge your friends. Dominate the leaderboard.
          </p>
        </div>

        {/* Welcome message for authenticated users */}
        {user && (
          <div className="text-center">
            <p className="text-lg text-purple-300">
              Welcome back, <span className="font-semibold text-white">{sessionStorage.getItem('guestNickname') || user.username}</span>!
            </p>
          </div>
        )}

        {/* Nickname Prompt for Guest - DISABLED
        {showNicknamePrompt && (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-white text-center">What should we call you?</CardTitle>
              <CardDescription className="text-purple-200 text-center">
                Enter a nickname to use in the game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNicknameSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nickname
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your nickname"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3"
                >
                  {isLoading ? 'Loading...' : 'Continue'}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowNicknamePrompt(false)}
                  className="w-full text-slate-400 hover:text-slate-300 text-sm"
                >
                  ← Back
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Play Card or Auth Form */}
        {!showNicknamePrompt && (user ? (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-3xl text-white text-center">Play Quiz</CardTitle>
              <CardDescription className="text-purple-200 text-center">
                Challenge yourself and compete against up to 3 opponents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>1-4 players per game</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Fill empty slots with AI opponents</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Real-time scoring and leaderboards</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Multiple categories and difficulty levels</span>
                </div>
              </div>
              <Button 
                onClick={onStartGame}
                className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
              >
                Start Playing
              </Button>
            </CardContent>
          </Card>
        ) : showAuthForm ? (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-white text-center">
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-purple-200 text-center">
                {mode === 'signin' ? 'Welcome back!' : 'Join the quiz community'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-6 bg-slate-900/50 rounded-lg p-1">
                <Button
                  onClick={() => setMode('signin')}
                  variant={mode === 'signin' ? 'default' : 'ghost'}
                  className={mode === 'signin' ? 'flex-1 bg-purple-600 hover:bg-purple-700' : 'flex-1 text-slate-400 hover:text-white'}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setMode('signup')}
                  variant={mode === 'signup' ? 'default' : 'ghost'}
                  className={mode === 'signup' ? 'flex-1 bg-purple-600 hover:bg-purple-700' : 'flex-1 text-slate-400 hover:text-white'}
                >
                  Sign Up
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password {mode === 'signup' && <span className="text-slate-400 text-xs">(minimum 6 characters)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Password"
                      required
                      minLength={6}
                    />
                  </div>
                  {mode === 'signup' && password.length > 0 && password.length < 6 && (
                    <p className="text-xs text-yellow-400 mt-1">Password must be at least 6 characters</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3"
                >
                  {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>

              {/* Guest play disabled - spoiler tracking requires authenticated users
              <Button
                onClick={handleAnonymousSignIn}
                disabled={isLoading}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Play as Guest
              </Button>
              */}
              </div>

              <button
                onClick={() => setShowAuthForm(false)}
                className="w-full text-slate-400 hover:text-slate-300 text-sm"
              >
                ← Back to welcome
              </button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-3xl text-white text-center">Get Started</CardTitle>
              <CardDescription className="text-purple-200 text-center">
                Create an account or sign in to start playing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>1-4 players per game</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Fill empty slots with AI opponents</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Real-time scoring and leaderboards</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Multiple categories and difficulty levels</span>
                </div>
              </div>
              <Button 
                onClick={() => setShowAuthForm(true)}
                className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
              >
                Sign In / Sign Up
              </Button>
              {/* Guest play disabled - spoiler tracking requires authenticated users
              <Button 
                onClick={handleAnonymousSignIn}
                disabled={isLoading}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 text-lg py-6"
              >
                {isLoading ? 'Loading...' : 'Play as Guest'}
              </Button>
              */}
            </CardContent>
          </Card>
        ))}

        {/* Quick Stats */}
        {!showNicknamePrompt && (
        <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-400">Coming Soon</div>
                <div className="text-sm text-slate-400">Players Online</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">Coming Soon</div>
                <div className="text-sm text-slate-400">Questions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">Coming Soon</div>
                <div className="text-sm text-slate-400">Games Played</div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Auth Buttons */}
        {!showNicknamePrompt && (
        <div className="flex gap-4 justify-center flex-wrap">
          {user && (
            <Button 
              onClick={onProfile}
              className="border-slate-600 text-white hover:bg-slate-800 bg-purple-600/30"
              variant="outline"
            >
              Profile
            </Button>
          )}
          <Button 
            onClick={onAdmin}
            className="border-slate-600 text-white hover:bg-slate-800 bg-slate-800/30"
            variant="outline"
          >
            Admin Dashboard
          </Button>
          {user && (
            <Button 
              onClick={async () => {
                const result = await authService.signOut()
                if (result.success) {
                  window.location.reload()
                }
              }}
              className="border-slate-600 text-white hover:bg-red-900/30 hover:border-red-500"
              variant="outline"
            >
              Sign Out
            </Button>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
