import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui"
import type { LobbyState, Player } from '@/lib/utils/types'
import { 
  createLobby, 
  fillWithAI,
  addSingleAI, 
  togglePlayerReady, 
  canStartGame,
  startLobbyGame,
  removePlayerFromLobby,
  updateGameOptions
} from '@/lib/services'
import { authService } from '@/lib/services'
import { cn, getDisplayName } from '@/lib/utils/utils'
import { PLAYER_STATE_EMOJIS } from '@/lib/constants'

interface LobbyAreaProps {
  onStartGame: (lobby: LobbyState) => void
  onExit: () => void
}

export function LobbyArea({ onStartGame, onExit }: LobbyAreaProps) {
  const [lobby, setLobby] = useState<LobbyState | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('')

  useEffect(() => {
    // Initialize lobby with current player
    const playerId = crypto.randomUUID()
    setCurrentPlayerId(playerId)

    const currentUser = authService.getCurrentUser()
    const playerName = getDisplayName(currentUser)

    const hostPlayer: Player = {
      id: playerId,
      name: playerName,
      isAI: false,
      score: 0,
      isReady: false
    }

    setLobby(createLobby(hostPlayer))
  }, [])

  const handleToggleReady = () => {
    if (!lobby) return
    setLobby(togglePlayerReady(lobby, currentPlayerId))
  }

  const handleFillWithAI = () => {
    if (!lobby) return
    setLobby(fillWithAI(lobby))
  }

  const handleAddSingleAI = () => {
    if (!lobby) return
    setLobby(addSingleAI(lobby))
  }

  const handleRemovePlayer = (playerId: string) => {
    if (!lobby || playerId === currentPlayerId) return
    setLobby(removePlayerFromLobby(lobby, playerId))
  }

  const handleStartGame = () => {
    if (!lobby || !canStartGame(lobby)) return
    const startedLobby = startLobbyGame(lobby)
    onStartGame(startedLobby)
  }

  const handleUpdateOption = (key: keyof LobbyState['gameOptions'], value: number) => {
    if (!lobby || !isHost) return
    setLobby(updateGameOptions(lobby, { [key]: value }))
  }

  if (!lobby) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-2xl w-full">
          <CardContent className="py-12">
            <div className="text-center text-purple-400 text-lg animate-pulse">
              Creating lobby...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const emptySlots = lobby.maxPlayers - lobby.players.length
  const isHost = lobby.hostId === currentPlayerId

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl text-white">
                Game Lobby
              </CardTitle>
              <Button 
                onClick={onExit}
                variant="outline"
                className="border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Leave
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Game Options - Host Only */}
        {isHost && (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-purple-300">Game Options</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="game-options" className="border-slate-700">
                  <AccordionTrigger className="text-slate-300 hover:text-purple-300">
                    Configure Game Settings
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                {/* Questions Per Game */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 font-semibold flex items-center justify-between">
                    <span>Questions Per Game</span>
                    <span className="text-purple-400 text-lg font-bold">{lobby.gameOptions.questionsPerGame}</span>
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={20}
                    value={lobby.gameOptions.questionsPerGame}
                    onChange={(e) => handleUpdateOption('questionsPerGame', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>5</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Question Time Limit */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 font-semibold flex items-center justify-between">
                    <span>Question Time (seconds)</span>
                    <span className="text-purple-400 text-lg font-bold">{lobby.gameOptions.questionTimeLimit}s</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={lobby.gameOptions.questionTimeLimit}
                    onChange={(e) => handleUpdateOption('questionTimeLimit', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>10s</span>
                    <span>60s</span>
                  </div>
                </div>

                {/* Selection Time Limit */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 font-semibold flex items-center justify-between">
                    <span>Category Selection Time (seconds)</span>
                    <span className="text-purple-400 text-lg font-bold">{lobby.gameOptions.selectionTimeLimit}s</span>
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={5}
                    value={lobby.gameOptions.selectionTimeLimit}
                    onChange={(e) => handleUpdateOption('selectionTimeLimit', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>5s</span>
                    <span>30s</span>
                  </div>
                </div>

                {/* I Know! Powerups */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 font-semibold flex items-center justify-between">
                    <span>"I KNOW!" Powerups</span>
                    <span className="text-purple-400 text-lg font-bold">{lobby.gameOptions.iKnowPowerupsPerPlayer}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={lobby.gameOptions.iKnowPowerupsPerPlayer}
                    onChange={(e) => handleUpdateOption('iKnowPowerupsPerPlayer', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Player Slots */}
        <div className="grid md:grid-cols-2 gap-4">
          {lobby.players.map((player) => (
            <Card 
              key={player.id}
              className={cn(
                "bg-slate-800/50 border-slate-700 backdrop-blur-sm transition-all",
                player.isReady && "border-green-600/50"
              )}
            >
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold",
                      player.isAI ? "bg-purple-600/30 text-purple-300" : "bg-blue-600/30 text-blue-300"
                    )}>
                      {player.isAI ? PLAYER_STATE_EMOJIS.ai : '👤'}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{player.name}</div>
                      <div className="text-sm text-slate-400">
                        {player.isAI ? 'AI Player' : 'Human'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.isReady && (
                      <div className="text-green-400 text-sm font-semibold">
                        {PLAYER_STATE_EMOJIS.ready} Ready
                      </div>
                    )}
                    {!player.isReady && player.id !== currentPlayerId && (
                      <div className="text-slate-500 text-sm">
                        Not Ready
                      </div>
                    )}
                    {player.isAI && isHost && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemovePlayer(player.id)}
                        className="border-red-600/50 text-red-400 hover:bg-red-600/20"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <Card 
              key={`empty-${index}`}
              className="bg-slate-800/30 border-slate-700 border-dashed backdrop-blur-sm"
            >
              <CardContent className="py-6">
                <div className="flex items-center justify-center h-12">
                  <div className="text-slate-500 text-sm">
                    Empty Slot
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Game Info */}
        <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-sm">
          <CardContent className="py-4">
            <div className="flex justify-between items-center text-sm">
              <div className="text-slate-400">
                <span className="text-purple-300 font-semibold">{lobby.players.length}</span> / {lobby.maxPlayers} Players
              </div>
              <div className="text-slate-400">
                {lobby.players.filter(p => p.isReady).length} / {lobby.players.length} Ready
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          {!lobby.players.find(p => p.id === currentPlayerId)?.isReady ? (
            <Button 
              onClick={handleToggleReady}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Ready Up
            </Button>
          ) : (
            <Button 
              onClick={handleToggleReady}
              variant="outline"
              className="flex-1 border-green-600 text-green-400 hover:bg-green-600/20"
            >
              Not Ready
            </Button>
          )}

          {emptySlots > 0 && (
            <>
              <Button 
                onClick={handleAddSingleAI}
                variant="outline"
                className="flex-1 border-purple-600 text-purple-400 hover:bg-purple-600/20"
              >
                Add AI Player
              </Button>
              <Button 
                onClick={handleFillWithAI}
                variant="outline"
                className="flex-1 border-purple-600 text-purple-400 hover:bg-purple-600/20"
              >
                Fill with AI ({emptySlots})
              </Button>
            </>
          )}

          {isHost && (
            <Button 
              onClick={handleStartGame}
              disabled={!canStartGame(lobby)}
              className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Card className="bg-slate-800/20 border-slate-700 backdrop-blur-sm">
          <CardContent className="py-4">
            <div className="text-center text-sm text-slate-400 space-y-2">
              <p>• Click "Ready Up" when you're ready to play</p>
              <p>• Fill empty slots with AI players or wait for friends</p>
              {isHost && <p>• As host, you can start the game when all players are ready</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
