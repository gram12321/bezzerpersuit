import { useState, useEffect } from "react"
import { GameArea, AdminDashboard, LobbyArea, ProfilePage, WelcomePage } from "@/components/pages"
import { authService } from "@/lib/services"
import type { LobbyState, User } from '@/lib/utils/types'

type AppPage = 'welcome' | 'lobby' | 'game' | 'admin' | 'profile'

interface AppState {
  currentPage: AppPage
  currentLobby: LobbyState | null
  user: User | null
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'welcome',
    currentLobby: null,
    user: null,
  })

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setAppState(prev => ({ ...prev, user }))
    })

    return unsubscribe
  }, [])

  // Show profile page
  if (appState.currentPage === 'profile') {
    return (
      <ProfilePage 
        onBack={() => setAppState(prev => ({ ...prev, currentPage: 'welcome' }))}
        onSignOut={() => setAppState(prev => ({ ...prev, currentPage: 'welcome', user: null }))}
      />
    )
  }

  // Show game area
  if (appState.currentPage === 'game' && appState.currentLobby) {
    return (
      <GameArea 
        lobby={appState.currentLobby} 
        onExit={() => setAppState(prev => ({ ...prev, currentPage: 'welcome', currentLobby: null }))} 
      />
    )
  }

  // Show lobby
  if (appState.currentPage === 'lobby') {
    return (
      <LobbyArea 
        onStartGame={(lobby) => setAppState(prev => ({ ...prev, currentPage: 'game', currentLobby: lobby }))}
        onExit={() => setAppState(prev => ({ ...prev, currentPage: 'welcome', currentLobby: null }))} 
      />
    )
  }

  // Show admin dashboard
  if (appState.currentPage === 'admin') {
    return (
      <AdminDashboard 
        onExit={() => setAppState(prev => ({ ...prev, currentPage: 'welcome', currentLobby: null }))} 
      />
    )
  }

  // Show welcome page
  return (
    <WelcomePage 
      user={appState.user}
      onStartGame={() => setAppState(prev => ({ ...prev, currentPage: 'lobby' }))}
      onProfile={() => setAppState(prev => ({ ...prev, currentPage: 'profile' }))}
      onAdmin={() => setAppState(prev => ({ ...prev, currentPage: 'admin' }))}
    />
  )
}

export default App
