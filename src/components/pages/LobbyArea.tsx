import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Accordion, AccordionItem, AccordionTrigger, AccordionContent, CollectionSelector } from "@/components/ui"
import type { LobbyState, Player, QuestionCollection } from '@/lib/utils'
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
import { cn, PLAYER_STATE_EMOJIS, getAvatarEmoji } from '@/lib/utils'
import { AI_PERSONALITIES } from '@/lib/constants'
import { getQuestionSummaries } from '@/database/questionsDB'

interface LobbyAreaProps {
  onStartGame: (lobby: LobbyState) => void
  onExit: () => void
}

export function LobbyArea({ onStartGame, onExit }: LobbyAreaProps) {
  const personalityOptions = Object.values(AI_PERSONALITIES)
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<string>(personalityOptions[0].id)
  const [lobby, setLobby] = useState<LobbyState | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('')
  const [availableCollections, setAvailableCollections] = useState<QuestionCollection[]>([])
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    // Initialize lobby with current player
    const currentUser = authService.getCurrentUser()

    if (!currentUser) {
      onExit()
      return
    }

    const playerId = currentUser.id
    setCurrentPlayerId(playerId)

    const playerName = currentUser.username

    const hostPlayer: Player = {
      id: playerId,
      name: playerName,
      isAI: false,
      score: 0,
      isReady: false
    }

    setLobby(createLobby(hostPlayer))

    // Fetch all questions as summaries to derive collections and counts
    getQuestionSummaries().then(summaries => {
      // derive collections
      const collectionsSet = new Set<string>()
      const counts: Record<string, number> = {}

      summaries.forEach(s => {
        s.questionCollection?.forEach(c => {
          collectionsSet.add(c)
          counts[c] = (counts[c] || 0) + 1
        })
      })

      setAvailableCollections(Array.from(collectionsSet).sort() as QuestionCollection[])
      setCollectionCounts(counts)
    }).catch(error => {
      console.error('Failed to load question metadata:', error)
    })
  }, [])

  const handleToggleReady = () => {
    if (!lobby) return
    setLobby(togglePlayerReady(lobby, currentPlayerId))
  }

  const handleFillWithAI = () => {
    if (!lobby) return
    setLobby(fillWithAI(lobby)) // Fills with random personalities
  }

  const handleAddSingleAI = () => {
    if (!lobby) return
    setLobby(addSingleAI(lobby, selectedPersonalityId))
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

  // Magic string to represent "No collections selected" (since [] means All)
  const NO_COLLECTION_SELECTION = '__NONE__'

  const handleToggleCollection = (collection: QuestionCollection) => {
    if (!lobby || !isHost) return

    const currentEnabled = lobby.gameOptions.enabledCollections
    let newEnabled: QuestionCollection[]

    if (currentEnabled.length === 0) {
      // All were enabled, now disable this one (enable all others)
      newEnabled = availableCollections.filter(c => c !== collection) as QuestionCollection[]
    } else if (currentEnabled.includes(NO_COLLECTION_SELECTION as QuestionCollection)) {
      // None were selected, now select just this one
      newEnabled = [collection as QuestionCollection]
    } else if (currentEnabled.includes(collection)) {
      // It was enabled, disable it
      newEnabled = currentEnabled.filter(c => c !== collection)
    } else {
      // It was disabled, enable it
      newEnabled = [...currentEnabled, collection]
    }

    // If all are now selected, set to empty array (meaning all enabled)
    // Also if we just deselected the last one, set to NONE marker instead of ALL
    if (newEnabled.length === availableCollections.length) {
      newEnabled = []
    } else if (newEnabled.length === 0) {
      newEnabled = [NO_COLLECTION_SELECTION]
    }

    setLobby(updateGameOptions(lobby, { enabledCollections: newEnabled }))
  }

  const handleToggleAllCollections = () => {
    if (!lobby || !isHost) return

    // Check if effectively all are enabled (empty array or full list)
    const allEnabled = lobby.gameOptions.enabledCollections.length === 0 ||
      lobby.gameOptions.enabledCollections.length === availableCollections.length

    if (allEnabled) {
      // Toggle to NONE
      setLobby(updateGameOptions(lobby, { enabledCollections: [NO_COLLECTION_SELECTION as QuestionCollection] }))
    } else {
      // Toggle to ALL
      setLobby(updateGameOptions(lobby, { enabledCollections: [] }))
    }
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
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Lobby Area */}
        <div className="space-y-6">
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
                            <span className="text-purple-400 text-lg font-bold">
                              {lobby.gameOptions.questionTimeLimit === 999 ? '∞' : `${lobby.gameOptions.questionTimeLimit}s`}
                            </span>
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={11}
                            step={1}
                            value={lobby.gameOptions.questionTimeLimit === 999 ? 11 : (lobby.gameOptions.questionTimeLimit - 10) / 5}
                            onChange={(e) => {
                              const sliderValue = parseInt(e.target.value)
                              const actualValue = sliderValue === 11 ? 999 : 10 + (sliderValue * 5)
                              handleUpdateOption('questionTimeLimit', actualValue)
                            }}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>10s</span>
                            <span>60s</span>
                            <span>∞</span>
                          </div>
                        </div>

                        {/* Selection Time Limit */}
                        <div className="space-y-2">
                          <label className="text-sm text-slate-300 font-semibold flex items-center justify-between">
                            <span>Category Selection Time (seconds)</span>
                            <span className="text-purple-400 text-lg font-bold">
                              {lobby.gameOptions.selectionTimeLimit === 999 ? '∞' : `${lobby.gameOptions.selectionTimeLimit}s`}
                            </span>
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={11}
                            step={1}
                            value={lobby.gameOptions.selectionTimeLimit === 999 ? 11 : (lobby.gameOptions.selectionTimeLimit - 5) / 5}
                            onChange={(e) => {
                              const sliderValue = parseInt(e.target.value)
                              const actualValue = sliderValue === 11 ? 999 : 5 + (sliderValue * 5)
                              handleUpdateOption('selectionTimeLimit', actualValue)
                            }}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>5s</span>
                            <span>60s</span>
                            <span>∞</span>
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
                        {getAvatarEmoji(player.avatar || (player.isAI ? 'robot' : 'default'))}
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
                <div className="flex items-center gap-4">
                  <div className="text-slate-400">
                    <span className="text-purple-300 font-semibold">{lobby.players.filter(p => p.isReady).length}</span> / {lobby.players.length} Ready
                  </div>
                  <div className="w-px h-4 bg-slate-700" />
                  <div className="text-slate-400">
                    <span className="text-purple-300 font-semibold">
                      {(() => {
                        const enabled = lobby.gameOptions.enabledCollections
                        const allEnabled = enabled.length === 0
                        const isNone = enabled.includes('__NONE__')

                        if (isNone) return 0
                        if (allEnabled) {
                          return Object.values(collectionCounts).reduce((a, b) => a + b, 0)
                        }

                        return availableCollections
                          .filter(c => enabled.includes(c))
                          .reduce((acc, c) => acc + (collectionCounts[c] || 0), 0)
                      })()}
                    </span> Active Questions
                  </div>
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
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs text-slate-400 mb-1">AI Personality</label>
                  <select
                    value={selectedPersonalityId}
                    onChange={e => setSelectedPersonalityId(e.target.value)}
                    className="w-full bg-slate-700 text-purple-300 rounded px-2 py-1 border border-slate-600 focus:outline-none"
                  >
                    {personalityOptions.map(p => (
                      <option key={p.id} value={p.id}>
                        {getAvatarEmoji(p.avatar)} {p.name}
                      </option>
                    ))}
                  </select>
                </div>
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

        {/* Collection Selector - Host Only */}
        {isHost && (
          <div className="lg:sticky lg:top-4 lg:self-start">
            <CollectionSelector
              availableCollections={availableCollections}
              enabledCollections={lobby.gameOptions.enabledCollections}
              collectionCounts={collectionCounts}
              onToggleCollection={handleToggleCollection}
              onToggleAll={handleToggleAllCollections}
            />
          </div>
        )}
      </div>
    </div>
  )
}
