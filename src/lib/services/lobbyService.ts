import type { LobbyState, Player, GameOptions } from '@/lib/utils'
import { AI_PERSONALITIES } from '@/lib/constants'
import { 
  QUESTIONS_PER_GAME, 
  QUESTION_TIME_LIMIT, 
  SELECTION_TIME_LIMIT, 
  I_KNOW_POWERUPS_PER_PLAYER 
} from '@/lib/utils'

/**
 * Lobby Service - Business logic for managing game lobbies
 */

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
 * Create an AI player with a specific personality
 */
export function createAIPlayer(personalityId?: string): Player {
  const personality = personalityId && AI_PERSONALITIES[personalityId]
    ? AI_PERSONALITIES[personalityId]
    : getRandomPersonality()
  return {
    id: crypto.randomUUID(),
    name: personality.name,
    avatar: personality.avatar,
    isAI: true,
    score: 0,
    isReady: true,
    aiPersonality: personality
  }
}

function getRandomPersonality(): typeof AI_PERSONALITIES[keyof typeof AI_PERSONALITIES] {
  const keys = Object.keys(AI_PERSONALITIES)
  const key = keys[Math.floor(Math.random() * keys.length)]
  return AI_PERSONALITIES[key]
}

/**
 * Fill empty slots with AI players
 */

/**
 * Fill empty slots with AI players, optionally specifying personalities
 */
export function fillWithAI(lobby: LobbyState, personalityIds?: string[]): LobbyState {
  const emptySlots = lobby.maxPlayers - lobby.players.length
  const aiPlayers: Player[] = []

  for (let i = 0; i < emptySlots; i++) {
    const personalityId = personalityIds && personalityIds[i] ? personalityIds[i] : undefined
    const aiPlayer = createAIPlayer(personalityId)
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

/**
 * Add a single AI player to the lobby, optionally specifying personality
 */
export function addSingleAI(lobby: LobbyState, personalityId?: string): LobbyState {
  if (lobby.players.length >= lobby.maxPlayers) {
    throw new Error('Lobby is full')
  }

  const aiPlayer = createAIPlayer(personalityId)

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
