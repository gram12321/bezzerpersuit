import { useState, useEffect } from 'react'
import { User, LogOut, Target, TrendingUp } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { authService, playerStatsService } from '@/lib/services'
import { STATUS_EMOJIS } from '@/lib/constants'
import type { User as UserType, PlayerStats } from '@/lib/utils/types'

interface ProfilePageProps {
  onBack?: () => void
  onSignOut?: () => void
}

export function ProfilePage({ onBack, onSignOut }: ProfilePageProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    setIsLoading(true)
    const currentUser = authService.getCurrentUser()
    
    if (currentUser) {
      setUser(currentUser)
      const playerStats = await playerStatsService.getStats(currentUser.id)
      setStats(playerStats)
    }
    
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    const result = await authService.signOut()
    if (result.success) {
      onSignOut?.() // Navigate back to welcome page
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <p className="text-slate-300">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <p className="text-slate-300">Unable to load profile</p>
            {onBack && (
              <Button onClick={onBack} className="mt-4">
                Back
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const accuracy = playerStatsService.calculateAccuracy(stats)

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-3xl">
              {user.avatarId ? (
                <span className="text-4xl">{user.avatarId}</span>
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{user.username}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="border-slate-600 text-white hover:bg-slate-800 hover:text-white">
                Back
              </Button>
            )}
            <Button onClick={handleSignOut} variant="outline" className="border-slate-600 text-white hover:bg-red-900/30 hover:text-white hover:border-red-500">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Questions Answered */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Questions Answered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.questionsAnswered}</p>
              <p className="text-xs text-slate-500 mt-1">Total questions</p>
            </CardContent>
          </Card>

          {/* Accuracy */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">{accuracy}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {stats.correctAnswers}/{stats.questionsAnswered} correct
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Statistics Overview</CardTitle>
            <CardDescription className="text-slate-400">
              Your gameplay performance breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Questions Answered</span>
                <span className="text-white font-semibold">{stats.questionsAnswered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{STATUS_EMOJIS.correct} Correct Answers</span>
                <span className="text-green-400 font-semibold">{stats.correctAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{STATUS_EMOJIS.incorrect} Incorrect Answers</span>
                <span className="text-red-400 font-semibold">{stats.incorrectAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Accuracy</span>
                <span className="text-purple-400 font-semibold">{accuracy}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
