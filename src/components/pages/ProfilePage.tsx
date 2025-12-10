import { useState, useEffect } from 'react'
import { User, LogOut, Target, TrendingUp, Edit } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { authService, playerStatsService } from '@/lib/services'
import { STATUS_EMOJIS } from '@/lib/utils'
import { AVATAR_OPTIONS, getAvatarEmoji } from '@/lib/utils/avatars'
import type { User as UserType, PlayerStats } from '@/lib/utils'

interface ProfilePageProps {
  onBack?: () => void
  onSignOut?: () => void
}

export function ProfilePage({ onBack, onSignOut }: ProfilePageProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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

  const startEdit = () => {
    setSaveError(null)
    setEditName(user?.username || '')
    setSelectedAvatar(user?.avatarId || AVATAR_OPTIONS[0].id)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setSaveError(null)

    const updates: any = {}
    if (editName && editName.trim() !== user.username) updates.username = editName.trim()
    if (selectedAvatar && selectedAvatar !== user.avatarId) updates.avatarId = selectedAvatar

    // Pre-check username availability to avoid server 409 conflict and noisy network errors
    if (updates.username) {
      const taken = await authService.isUsernameTaken(updates.username)
      if (taken) {
        setSaveError('That username is already taken. Please choose another.')
        setIsSaving(false)
        return
      }
    }

    const result = await authService.updateProfile(updates)


    if (result.success) {
      await loadUserData()
      setIsEditing(false)
    } else {
      // Friendly error for duplicate username
      if (result.error && result.error.toLowerCase().includes('duplicate') && result.error.toLowerCase().includes('username')) {
        setSaveError('That username is already taken. Please choose another.')
      } else {
        setSaveError(result.error || 'Failed to save profile')
      }
      // Suppress console error for user-caused issues
      if (result.error && result.error.toLowerCase().includes('duplicate')) return
    }

    setIsSaving(false)
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
                <span className="text-4xl">{getAvatarEmoji(user.avatarId)}</span>
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
              <Button size="sm" variant="outline" onClick={onBack} className="border-slate-600 text-white hover:bg-slate-800 hover:text-white">
                Back
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={startEdit} className="border-slate-600 text-white hover:bg-slate-800/40">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={handleSignOut} className="border-red-600 text-white hover:bg-red-900/30 hover:text-white hover:border-red-500">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Edit form (inline) */}
        {isEditing && (
          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Edit Profile</CardTitle>
              <CardDescription className="text-slate-400">Change your display name and avatar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 block mb-2">Display Name</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300 block mb-2">Choose Avatar</label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedAvatar(a.id)}
                        aria-pressed={selectedAvatar === a.id}
                        className={`p-3 rounded-md flex items-center justify-center text-2xl transition-colors focus:outline-none ${selectedAvatar === a.id ? 'bg-white/10 ring-2 ring-white' : 'hover:bg-slate-800/40'}`}
                      >
                        <span>{a.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-slate-300 block">Preview</label>
                    <div className="mt-2 w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl text-purple-700">
                      <span>{getAvatarEmoji(selectedAvatar || AVATAR_OPTIONS[0].id)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isSaving} className="border-slate-600 text-white hover:bg-slate-800/30">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-500">
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>

                {saveError && (
                  <div className="text-sm font-semibold text-red-700 bg-red-100 border border-red-300 p-3 rounded mt-2">
                    {saveError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
