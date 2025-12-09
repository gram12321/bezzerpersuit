import type { LobbyState, Player, GameOptions } from '@/lib/utils'
import { 
  QUESTIONS_PER_GAME, 
  QUESTION_TIME_LIMIT, 
  SELECTION_TIME_LIMIT, 
  I_KNOW_POWERUPS_PER_PLAYER 
} from '@/lib/utils'

/**
 * Lobby Service - Business logic for managing game lobbies
 */

const AI_NAMES = [
  'RoboQuiz',
  'BrainBot',
  'QuizMaster AI',
  'Smarty McBot',
  'The Professor',
  'Quiz Wizard'
]

/**
 * Create a new lobby
 */
export function createLobby(hostPlayer: Player): LobbyState {
  return {
    id: crypto.randomUUID(),
    hostId: hostPlayer.id,
    players: [hostPlayer],
    maxPlayers: 4,
    isStarted: false,
    createdAt: new Date(),
    gameOptions: {
      questionsPerGame: QUESTIONS_PER_GAME,
      questionTimeLimit: QUESTION_TIME_LIMIT,
      selectionTimeLimit: SELECTION_TIME_LIMIT,
      iKnowPowerupsPerPlayer: I_KNOW_POWERUPS_PER_PLAYER
    }
  }
}

/**
 * Add a player to the lobby
 */
export function addPlayerToLobby(lobby: LobbyState, player: Player): LobbyState {
  if (lobby.players.length >= lobby.maxPlayers) {
    throw new Error('Lobby is full')
  }

  if (lobby.isStarted) {
    throw new Error('Game has already started')
  }

  if (lobby.players.some(p => p.id === player.id)) {
    throw new Error('Player already in lobby')
  }

  return {
    ...lobby,
    players: [...lobby.players, player]
  }
}

/**
 * Remove a player from the lobby
 */
export function removePlayerFromLobby(lobby: LobbyState, playerId: string): LobbyState {
  return {
    ...lobby,
    players: lobby.players.filter(p => p.id !== playerId)
  }
}

/**
 * Create an AI player
 */
export function createAIPlayer(): Player {
  const usedNames = new Set<string>()
  
  return {
    id: crypto.randomUUID(),
    name: getUniqueName(usedNames),
    isAI: true,
    score: 0,
    isReady: true
  }
}

/**
 * Get a unique AI name
 */
function getUniqueName(usedNames: Set<string>): string {
  const availableNames = AI_NAMES.filter(name => !usedNames.has(name))
  if (availableNames.length === 0) {
    return `AI Player ${Math.floor(Math.random() * 1000)}`
  }
  const name = availableNames[Math.floor(Math.random() * availableNames.length)]
  usedNames.add(name)
  return name
}

/**
 * Fill empty slots with AI players
 */
export function fillWithAI(lobby: LobbyState): LobbyState {
  const usedNames = new Set(lobby.players.map(p => p.name))
  const emptySlots = lobby.maxPlayers - lobby.players.length
  const aiPlayers: Player[] = []

  for (let i = 0; i < emptySlots; i++) {
    const aiPlayer = createAIPlayer()
    aiPlayer.name = getUniqueName(usedNames)
    aiPlayers.push(aiPlayer)
  }

  return {
    ...lobby,
    players: [...lobby.players, ...aiPlayers]
  }
}

/**
 * Add a single AI player to the lobby
 */
export function addSingleAI(lobby: LobbyState): LobbyState {
  if (lobby.players.length >= lobby.maxPlayers) {
    throw new Error('Lobby is full')
  }

  const usedNames = new Set(lobby.players.map(p => p.name))
  const aiPlayer = createAIPlayer()
  aiPlayer.name = getUniqueName(usedNames)

  return {
    ...lobby,
    players: [...lobby.players, aiPlayer]
  }
}

/**
 * Toggle player ready status
 */
export function togglePlayerReady(lobby: LobbyState, playerId: string): LobbyState {
  return {
    ...lobby,
    players: lobby.players.map(p =>
      p.id === playerId ? { ...p, isReady: !p.isReady } : p
    )
  }
}

/**
 * Check if all players are ready
 */
export function areAllPlayersReady(lobby: LobbyState): boolean {
  return lobby.players.length > 0 && lobby.players.every(p => p.isReady)
}

/**
 * Check if lobby can start (2-4 players, all ready)
 */
export function canStartGame(lobby: LobbyState): boolean {
  return lobby.players.length >= 2 && lobby.players.length <= 4 && areAllPlayersReady(lobby)
}

/**
 * Update game options (host only)
 */
export function updateGameOptions(lobby: LobbyState, options: Partial<GameOptions>): LobbyState {
  return {
    ...lobby,
    gameOptions: {
      ...lobby.gameOptions,
      ...options
    }
  }
}

/**
 * Start the game
 */
export function startLobbyGame(lobby: LobbyState): LobbyState {
  if (!canStartGame(lobby)) {
    throw new Error('Cannot start game: not all players are ready')
  }

  return {
    ...lobby,
    isStarted: true
  }
}
