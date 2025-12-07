import { useState } from "react"
import { Button } from "@/components/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { GameArea, AdminDashboard, LobbyArea } from "@/components/pages"
import type { LobbyState } from '@/lib/utils/types'

type AppPage = 'home' | 'lobby' | 'game' | 'admin'

interface AppState {
  currentPage: AppPage
  currentLobby: LobbyState | null
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'home',
    currentLobby: null,
  })

  // Show game area
  if (appState.currentPage === 'game' && appState.currentLobby) {
    return (
      <GameArea 
        lobby={appState.currentLobby} 
        onExit={() => setAppState({ currentPage: 'home', currentLobby: null })} 
      />
    )
  }

  // Show lobby
  if (appState.currentPage === 'lobby') {
    return (
      <LobbyArea 
        onStartGame={(lobby) => setAppState({ currentPage: 'game', currentLobby: lobby })}
        onExit={() => setAppState({ currentPage: 'home', currentLobby: null })} 
      />
    )
  }

  // Show admin dashboard
  if (appState.currentPage === 'admin') {
    return (
      <AdminDashboard 
        onExit={() => setAppState({ currentPage: 'home', currentLobby: null })} 
      />
    )
  }

  // Show home page
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

        {/* Play Card */}
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
              onClick={() => setAppState({ currentPage: 'lobby', currentLobby: null })}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
            >
              Start Playing
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
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

        {/* Auth Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
            Sign In
          </Button>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
            Sign Up
          </Button>
          <Button 
            onClick={() => setAppState({ currentPage: 'admin', currentLobby: null })}
            className="border-slate-600 text-white hover:bg-slate-800 bg-slate-800/30"
            variant="outline"
          >
            Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
