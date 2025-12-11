import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { useGameState } from "@/hooks"
import { cn, getDifficultyColorClasses, QUIZ_DIFFICULTY_LEVELS, createDifficultyScore, QUESTIONS_PER_GAME, getCategoryColorClasses, getCategoryEmoji, getDifficultyEmoji, PLAYER_STATE_EMOJIS, STATUS_EMOJIS, getCategoriesByTheme, getShortenedCategoryName, getAvatarEmoji } from "@/lib/utils"
import type { LobbyState, QuestionCategory } from '@/lib/utils'
import { isCategoryUsed, isDifficultyUsed } from "@/lib/services/gameService"
import { calculatePlayerPointsForDisplay } from '@/lib/services'


interface GameAreaProps {
  lobby: LobbyState
  onExit: () => void
}

export function GameArea({ lobby, onExit }: GameAreaProps) {
  const { gameState, startGame, submitAnswer, nextQuestion, endGame, selectCategory, selectDifficulty, getCurrentTurnPlayer, useIKnow } = useGameState(lobby)

  if (gameState.isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-2xl w-full">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="text-purple-400 text-lg animate-pulse">
                Loading questions...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState.error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-red-400 text-lg">
                {gameState.error}
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => startGame(lobby)}
                className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Try Again
              </Button>
              <Button 
                onClick={onExit}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gameState.isGameActive && gameState.questions.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">
              Ready to Play
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-purple-200 text-lg font-semibold">
                Turn-Based Trivia Challenge!
              </p>
              <div className="space-y-2.5 text-sm text-slate-300">
                <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                  <p className="font-semibold text-purple-300 mb-1">🎯 How It Works</p>
                  <p className="text-xs">Players take turns choosing category & difficulty for each question</p>
                </div>
                <p>• <span className="text-purple-300 font-semibold">Turn Player</span> gets first crack at the question</p>
                <p>• <span className="text-blue-300 font-semibold">Other Players</span> can score if turn player is wrong, or decrease the turn player's points by answering correctly</p>
                <p>• Use <span className="text-orange-300 font-semibold">"I KNOW!"</span> power-up ({lobby.gameOptions.iKnowPowerupsPerPlayer}x) for a chance at double points when not in turn if turn player can't answer</p>
                <p>• {lobby.gameOptions.questionTimeLimit}s to answer • {lobby.gameOptions.selectionTimeLimit}s to select</p>
                <p>• {lobby.gameOptions.questionsPerGame} questions total</p>
                <p>• Playing with up to {gameState.players.length - 1} opponent{gameState.players.length > 2 ? 's' : ''} or AI's</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => startGame(lobby)}
                disabled={gameState.isLoading}
                className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Start Game
              </Button>
              <Button 
                onClick={onExit}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gameState.isGameActive) {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score)
    const currentPlayerRank = sortedPlayers.findIndex(p => p.id === gameState.currentPlayerId) + 1

    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">
              Game Over!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-purple-400">
                {gameState.score}
              </div>
              <p className="text-purple-200 text-lg">Your Final Score</p>
              <div className="text-2xl font-semibold text-white">
                {currentPlayerRank === 1 && '🏆 1st Place!'}
                {currentPlayerRank === 2 && '🥈 2nd Place'}
                {currentPlayerRank === 3 && '🥉 3rd Place'}
                {currentPlayerRank > 3 && `${currentPlayerRank}th Place`}
              </div>
            </div>

            {/* Final Leaderboard */}
            <div className="space-y-2">
              <p className="text-sm text-slate-400 text-center mb-3">Final Rankings</p>
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    player.id === gameState.currentPlayerId
                      ? "bg-purple-600/30 border border-purple-500/50"
                      : "bg-slate-700/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 && "bg-yellow-500/30 text-yellow-300",
                      index === 1 && "bg-slate-400/30 text-slate-300",
                      index === 2 && "bg-orange-700/30 text-orange-300",
                      index > 2 && "bg-slate-600/30 text-slate-400"
                    )}>
                      {index + 1}
                    </div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <span className="text-lg">{getAvatarEmoji(player.avatar || (player.isAI ? 'robot' : 'default'))}</span>
                      <span>{player.name}</span>
                    </div>
                  </div>
                  <div className="text-purple-300 font-bold">
                    {player.score.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={onExit}
                variant="outline"
                className="flex-1 border-slate-600 text-white hover:bg-slate-800"
              >
                Back to Lobby
              </Button>
              <Button 
                onClick={onExit}
                className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Exit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
  const currentTurnPlayer = getCurrentTurnPlayer()
  const isCurrentPlayersTurn = currentTurnPlayer?.id === gameState.currentPlayerId

  // Category Selection Phase
  if (gameState.gamePhase === 'category-selection') {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-3xl lg:max-w-5xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">
              {isCurrentPlayersTurn ? "Your Turn!" : `${currentTurnPlayer?.name}'s Turn`}
            </CardTitle>
            <p className="text-center text-purple-300 text-lg mt-2">
              {isCurrentPlayersTurn ? "Choose a category and difficulty" : "Waiting for category selection..."}
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <p className="text-center text-slate-400 text-sm">
                Question {gameState.currentQuestionIndex + 1} of {QUESTIONS_PER_GAME}
              </p>
              <div className={cn(
                "text-sm font-bold px-3 py-1 rounded",
                gameState.selectionTimeRemaining <= 5 ? "bg-red-600/30 text-red-300" : "bg-slate-700/50 text-slate-300"
              )}>
                {STATUS_EMOJIS.timer} {gameState.selectionTimeRemaining}s
              </div>
            </div>
            
            {/* Show current selections being made */}
            {!isCurrentPlayersTurn && (gameState.currentSelectionCategory || gameState.currentSelectionDifficulty) && (
              <div className="mt-4 p-3 bg-purple-600/20 border border-purple-500/50 rounded-lg">
                <p className="text-sm text-purple-200 text-center mb-2">
                  {currentTurnPlayer?.name} is choosing...
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {gameState.currentSelectionCategory && (
                    <span className="text-xs px-3 py-1.5 rounded bg-purple-600/50 text-white font-semibold border border-purple-400/50 animate-pulse">
                      {getCategoryEmoji(gameState.currentSelectionCategory)} {gameState.currentSelectionCategory}
                    </span>
                  )}
                  {gameState.currentSelectionDifficulty && (
                    <span className={cn(
                      "text-xs px-3 py-1.5 rounded text-white font-semibold border animate-pulse",
                      getDifficultyColorClasses(gameState.currentSelectionDifficulty)
                    )}>
                      {getDifficultyEmoji(gameState.currentSelectionDifficulty)} {QUIZ_DIFFICULTY_LEVELS.find(l => gameState.currentSelectionDifficulty! <= l.max)?.category || 'Unknown'}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Show what the turn player has used so far */}
            {currentTurnPlayer && ((currentTurnPlayer.usedCategories?.length || 0) > 0 || (currentTurnPlayer.usedDifficulties?.length || 0) > 0) && (
              <div className="mt-3 p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg">
                <p className="text-xs text-slate-400 text-center mb-2">{currentTurnPlayer.name} has already used:</p>
                <div className="space-y-2">
                  {(currentTurnPlayer.usedCategories?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {currentTurnPlayer.usedCategories!.map((cat) => (
                        <span key={cat} className="text-[10px] px-2 py-0.5 rounded bg-slate-600/50 text-slate-400 line-through">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                  {(currentTurnPlayer.usedDifficulties?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {currentTurnPlayer.usedDifficulties!.map((diff, idx) => {
                        const level = QUIZ_DIFFICULTY_LEVELS.find(l => diff <= l.max)
                        return (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-600/50 text-slate-400 line-through">
                            {level?.category || 'Unknown'}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isCurrentPlayersTurn ? (
              <>
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold text-sm">
                      Select Category
                      {gameState.selectedCategory && (
                        <span className="ml-2 text-xs text-green-400">✓</span>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {getCategoriesByTheme().map((theme) => {
                        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId)
                        return (
                          <div key={theme.themeKey} className="space-y-1">
                            <div className="text-xs font-medium text-slate-400 px-1 flex items-center gap-1">
                              <span>{theme.emoji}</span>
                              <span className="hidden md:inline">{theme.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              {theme.categories.map((category) => {
                                const isUsed = isCategoryUsed(category as QuestionCategory, currentPlayer?.usedCategories || [])
                                const shortName = getShortenedCategoryName(category)
                                return (
                                  <Button
                                    key={category}
                                    onClick={() => !isUsed && selectCategory(category as QuestionCategory)}
                                    disabled={isUsed}
                                    className={cn(
                                      "text-left justify-start h-auto py-1.5 px-2 text-xs relative",
                                      gameState.selectedCategory === category
                                        ? `${getCategoryColorClasses(category)} border border-white ring-1 ring-white ring-offset-1 ring-offset-slate-900`
                                        : isUsed
                                        ? "bg-slate-800/50 text-slate-600 cursor-not-allowed line-through"
                                        : getCategoryColorClasses(category)
                                    )}
                                    title={category}
                                  >
                                    <span className="mr-1.5 shrink-0">{getCategoryEmoji(category)}</span>
                                    <span className="truncate">{shortName}</span>
                                    {isUsed && <span className="ml-auto shrink-0 text-xs">{STATUS_EMOJIS.incorrect}</span>}
                                  </Button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Difficulty Selection */}
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold text-sm">
                      Select Difficulty
                      {gameState.selectedDifficulty && (
                        <span className="ml-2 text-xs text-green-400">✓</span>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUIZ_DIFFICULTY_LEVELS.map((level) => {
                        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId)
                        const targetDifficulty = createDifficultyScore(level.max - 0.05)
                        const isSelected = gameState.selectedDifficulty && 
                          Math.abs(gameState.selectedDifficulty - targetDifficulty) < 0.01
                        const isUsed = isDifficultyUsed(targetDifficulty, currentPlayer?.usedDifficulties || [])
                        
                        return (
                          <Button
                            key={level.max}
                            onClick={() => !isUsed && selectDifficulty(targetDifficulty)}
                            disabled={isUsed}
                            className={cn(
                              "w-full text-center justify-center h-auto py-2 px-2 text-xs relative",
                              isSelected
                                ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                                : "",
                              isUsed
                                ? "bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50"
                                : level.buttonColorClasses
                            )}
                            title={isUsed ? `Already used` : level.description}
                          >
                            <div>
                              <div className={cn("font-semibold", isUsed && "line-through")}>
                                {level.category}
                                {isUsed && <span className="ml-1">✗</span>}
                              </div>
                              <div className="text-[10px] opacity-80">{level.max * 100}%</div>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                
                {gameState.selectedCategory && gameState.selectedDifficulty && (
                  <div className="text-center py-2 px-4 bg-green-600/20 border border-green-600/50 rounded-lg">
                    <p className="text-green-300 font-semibold text-sm">
                      {STATUS_EMOJIS.correct} Selection complete! Loading question...
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Category Selection - Disabled for non-turn players */}
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold text-sm">
                      Category Selection
                      {gameState.currentSelectionCategory && (
                        <span className="ml-2 text-xs text-green-400">✓</span>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {getCategoriesByTheme().map((theme) => (
                        <div key={theme.themeKey} className="space-y-1">
                          <div className="text-xs font-medium text-slate-400 px-1 flex items-center gap-1">
                            <span>{theme.emoji}</span>
                            <span className="hidden md:inline">{theme.name}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {theme.categories.map((category) => {
                              const isUsed = isCategoryUsed(category as QuestionCategory, currentTurnPlayer?.usedCategories || [])
                              const isSelected = gameState.currentSelectionCategory === category
                              const shortName = getShortenedCategoryName(category)
                              return (
                                <Button
                                  key={category}
                                  disabled={true}
                                  className={cn(
                                    "text-left justify-start h-auto py-1.5 px-2 text-xs relative cursor-default",
                                    isSelected
                                      ? "bg-purple-600 border border-purple-400 text-white"
                                      : isUsed
                                      ? "bg-slate-800/50 text-slate-600 line-through"
                                      : "bg-slate-700/50 text-slate-300"
                                  )}
                                  title={category}
                                >
                                  <span className="mr-1.5 shrink-0">{getCategoryEmoji(category)}</span>
                                  <span className="truncate">{shortName}</span>
                                  {isUsed && <span className="ml-auto shrink-0 text-xs">{STATUS_EMOJIS.incorrect}</span>}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Selection - Disabled for non-turn players */}
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold text-sm">
                      Difficulty Selection
                      {gameState.currentSelectionDifficulty && (
                        <span className="ml-2 text-xs text-green-400">✓</span>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUIZ_DIFFICULTY_LEVELS.map((level) => {
                        const targetDifficulty = createDifficultyScore(level.max - 0.05)
                        const isSelected = gameState.currentSelectionDifficulty && 
                          Math.abs(gameState.currentSelectionDifficulty - targetDifficulty) < 0.01
                        const isUsed = isDifficultyUsed(targetDifficulty, currentTurnPlayer?.usedDifficulties || [])
                        
                        return (
                          <Button
                            key={level.max}
                            disabled={true}
                            className={cn(
                              "w-full text-center justify-center h-auto py-2 px-2 text-xs relative cursor-default",
                              isSelected
                                ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                                : "",
                              isUsed
                                ? "bg-slate-800/50 text-slate-600 opacity-50"
                                : level.buttonColorClasses.replace('hover:', '')
                            )}
                          >
                            <div>
                              <div className={cn("font-semibold", isUsed && "line-through")}>
                                {getDifficultyEmoji(level.max - 0.05)} {level.category}
                                {isUsed && <span className="ml-1">{STATUS_EMOJIS.incorrect}</span>}
                              </div>
                              <div className="text-[10px] opacity-80">{level.max * 100}%</div>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                
                {gameState.currentSelectionCategory && gameState.currentSelectionDifficulty && (
                  <div className="text-center py-2 px-4 bg-green-600/20 border border-green-600/50 rounded-lg">
                    <p className="text-green-300 font-semibold text-sm">
                      ✓ {currentTurnPlayer?.name} has made their selection! Loading question...
                    </p>
                  </div>
                )}
              </>
            )}
            <Button 
              onClick={endGame}
              variant="outline"
              className="w-full border-slate-600 text-white hover:bg-slate-800"
            >
              Exit Game
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-6">
        {/* Players Leaderboard */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gameState.players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => {
                  const isTurnPlayer = player.id === currentTurnPlayer?.id
                  return (
                    <div 
                      key={player.id}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg relative",
                        player.id === gameState.currentPlayerId 
                          ? "bg-purple-600/30 border border-purple-500/50" 
                          : "bg-slate-700/30",
                        isTurnPlayer && "ring-2 ring-yellow-500/50"
                      )}
                    >
                      {isTurnPlayer && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          {PLAYER_STATE_EMOJIS.host}
                        </div>
                      )}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        index === 0 && "bg-yellow-500/30 text-yellow-300",
                        index === 1 && "bg-slate-400/30 text-slate-300",
                        index === 2 && "bg-orange-700/30 text-orange-300",
                        index > 2 && "bg-slate-600/30 text-slate-400"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-sm font-semibold truncate",
                          player.id === gameState.currentPlayerId ? "text-purple-200" : "text-white"
                        )}>
                        <span className="text-lg mr-2">{getAvatarEmoji(player.avatar || (player.isAI ? 'robot' : 'default'))}</span>
                        {player.name}
                        {player.isAI && ` ${PLAYER_STATE_EMOJIS.ai}`}
                      </div>
                      <div className="text-xs text-slate-400">{player.score.toFixed(2)} pts</div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Header with stats */}
        <div className="flex justify-between items-center">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm px-6 py-3">
            <div className="text-white">
              <div className="text-sm text-slate-400">Your Score</div>
              <div className="text-2xl font-bold text-purple-400">{gameState.score}</div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm px-6 py-3">
            <div className="text-white">
              <div className="text-sm text-slate-400">Question</div>
              <div className="text-2xl font-bold text-purple-400">
                {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
              </div>
            </div>
          </Card>

          <Card className={cn(
            "border-slate-700 backdrop-blur-sm px-6 py-3",
            gameState.timeRemaining <= 5 ? "bg-red-900/50" : "bg-slate-800/50"
          )}>
            <div className="text-white">
              <div className="text-sm text-slate-400">Time</div>
              <div className={cn(
                "text-2xl font-bold",
                gameState.timeRemaining <= 5 ? "text-red-400" : "text-purple-400"
              )}>
                {gameState.timeRemaining}s
              </div>
            </div>
          </Card>
        </div>

        {/* Question Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex gap-2 items-center flex-wrap">
                  {currentQuestion.categories.map((cat) => (
                    <span key={cat} className={cn("text-xs px-2 py-1 rounded", getCategoryColorClasses(cat))}>
                      {getCategoryEmoji(cat)} {cat}
                    </span>
                  ))}
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    getDifficultyColorClasses(currentQuestion.difficulty)
                  )}>
                    {getDifficultyEmoji(currentQuestion.difficulty)} {QUIZ_DIFFICULTY_LEVELS.find(l => currentQuestion.difficulty <= l.max)?.category || 'Unknown'}
                  </span>
                  <span className="text-xs px-3 py-1 rounded bg-linear-to-r from-yellow-600 to-yellow-500 text-white font-semibold border border-yellow-400/50">
                    {PLAYER_STATE_EMOJIS.host} Turn Player: {currentTurnPlayer?.name}
                  </span>
                </div>
                <CardTitle className="text-2xl text-white">
                  {currentQuestion.question}
                </CardTitle>
                <p className="text-sm text-slate-400">
                  {isCurrentPlayersTurn 
                    ? "Get it right to score! Others can't score if you're correct." 
                    : "Answer correctly to score if the turn player is wrong!"}
                </p>
                {/* Show I KNOW usage indicator */}
                {(() => {
                  const iKnowPlayers = gameState.players.filter(p => p.usedIKnowThisRound)
                  if (iKnowPlayers.length === 0) return null
                  
                  return (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-orange-400 animate-pulse">{STATUS_EMOJIS.lightning} I KNOW! ACTIVE:</span>
                      {iKnowPlayers.map(player => (
                        <span 
                          key={player.id}
                          className="text-xs px-2 py-1 rounded bg-linear-to-r from-orange-600 to-red-600 text-white font-semibold border border-orange-400"
                        >
                          {player.name} {player.isAI && PLAYER_STATE_EMOJIS.ai}
                        </span>
                      ))}
                    </div>
                  )
                })()}
              </div>
              <Button 
                onClick={endGame}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Exit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* I KNOW Button for non-turn players */}
            {!isCurrentPlayersTurn && gameState.gamePhase === 'answering' && (
              <div className="flex justify-center">
                {(() => {
                  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId)
                  const powerupsLeft = currentPlayer?.iKnowPowerupsRemaining || 0
                  const usedThisRound = currentPlayer?.usedIKnowThisRound || false
                  const hasAnswered = currentPlayer?.hasAnswered || false
                  
                  if (usedThisRound) {
                    return (
                      <div className="px-4 py-2 rounded-lg bg-linear-to-r from-orange-600 to-red-600 text-white font-bold border-2 border-orange-400">
                        {STATUS_EMOJIS.lightning} I KNOW! ACTIVE {STATUS_EMOJIS.lightning}
                      </div>
                    )
                  }
                  
                  return (
                    <Button
                      onClick={() => useIKnow(gameState.currentPlayerId)}
                      disabled={powerupsLeft === 0 || hasAnswered}
                      className={cn(
                        "px-6 py-3 font-bold text-lg",
                        powerupsLeft > 0 && !hasAnswered
                          ? "bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-2 border-orange-300 shadow-lg"
                          : "bg-slate-600 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {STATUS_EMOJIS.lightning} I KNOW! ({powerupsLeft} left)
                    </Button>
                  )
                })()}
              </div>
            )}
            
            {currentQuestion.answers.map((answer, index) => {
              const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId)
              const hasPlayerAnswered = currentPlayer?.hasAnswered || false
              
              // Find ALL players who selected this answer (including current player)
              const playersWhoSelectedThis = gameState.players.filter(
                p => p.selectedAnswer === index
              )
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <Button
                      onClick={() => !hasPlayerAnswered && submitAnswer(index, gameState.currentPlayerId)}
                      disabled={hasPlayerAnswered || gameState.gamePhase === 'results'}
                      className={cn(
                        "flex-1 justify-start text-left h-auto py-4 px-6 text-base",
                        !hasPlayerAnswered && gameState.gamePhase === 'answering' && "bg-slate-700 hover:bg-slate-600 text-white",
                        hasPlayerAnswered && currentPlayer?.selectedAnswer === index && "bg-blue-600 hover:bg-blue-600 text-white",
                        gameState.gamePhase === 'results' && index === currentQuestion.correctAnswerIndex && "bg-green-600 hover:bg-green-600 text-white",
                        gameState.gamePhase === 'results' && index === currentPlayer?.selectedAnswer && index !== currentQuestion.correctAnswerIndex && "bg-red-600 hover:bg-red-600 text-white",
                        gameState.gamePhase === 'results' && index !== currentQuestion.correctAnswerIndex && index !== currentPlayer?.selectedAnswer && "bg-slate-700/50 text-slate-400"
                      )}
                    >
                      <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                      {answer}
                    </Button>
                    
                    {/* Show player avatars who selected this answer */}
                    {playersWhoSelectedThis.length > 0 && (hasPlayerAnswered || gameState.gamePhase === 'results') && (
                      <div className="flex gap-1 items-center">
                        {playersWhoSelectedThis.map(player => {
                          const isTurnPlayer = player.id === currentTurnPlayer?.id
                          const isCurrentUser = player.id === gameState.currentPlayerId
                          const usedIKnow = player.usedIKnowThisRound
                          return (
                            <div
                              key={player.id}
                              className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap",
                                isCurrentUser && "bg-purple-600/50 text-purple-100 border border-purple-400",
                                !isCurrentUser && gameState.gamePhase === 'results' && index === currentQuestion.correctAnswerIndex && "bg-green-600/50 text-green-100",
                                !isCurrentUser && gameState.gamePhase === 'results' && index !== currentQuestion.correctAnswerIndex && "bg-red-600/50 text-red-100",
                                !isCurrentUser && gameState.gamePhase === 'answering' && "bg-slate-600/50 text-slate-200",
                                isTurnPlayer && "ring-1 ring-yellow-400",
                                usedIKnow && !isTurnPlayer && "ring-2 ring-orange-400 bg-linear-to-r from-orange-600/30 to-red-600/30"
                              )}
                              title={player.name}
                            >
                              {usedIKnow && !isTurnPlayer && <span className="animate-pulse">⚡</span>}
                              {isTurnPlayer && <span>👑</span>}
                              <span className="text-sm mr-1">{getAvatarEmoji(player.avatar || (player.isAI ? 'robot' : 'default'))}</span>
                              <span>{player.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  {/* Show other players who selected this answer after current player has answered */}
                  {hasPlayerAnswered && gameState.gamePhase === 'answering' && playersWhoSelectedThis.length > 0 && false && (
                    <div className="flex gap-1 flex-wrap pl-6">
                      {playersWhoSelectedThis.map(player => {
                        const isTurnPlayer = player.id === currentTurnPlayer?.id
                        return (
                          <span
                            key={player.id}
                            className="text-xs px-2 py-1 rounded bg-slate-600/50 text-slate-300 flex items-center gap-1"
                          >
                            {isTurnPlayer && '👑'}
                            {player.name}
                            {player.isAI && ' 🤖'}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            
            {gameState.gamePhase === 'answering' && gameState.players.find(p => p.id === gameState.currentPlayerId)?.hasAnswered && (
              <div className="text-center text-purple-300 text-sm py-2 animate-pulse">
                Waiting for other players...
              </div>
            )}

            {gameState.gamePhase === 'results' && (
              <div className="pt-4 space-y-4">
                <div className={cn(
                  "p-4 rounded-lg",
                  "bg-slate-700/50"
                )}>
                  <p className="font-bold text-lg text-white text-center mb-3">
                    Round Results
                  </p>
                  <div className="space-y-2">
                    {gameState.players.map((player, index) => {
                      const isCorrect = player.selectedAnswer === currentQuestion.correctAnswerIndex
                      const turnPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentTurnPlayerId)
                      const isTurnPlayer = player.id === gameState.currentTurnPlayerId
                      const turnPlayerCorrect = gameState.players[turnPlayerIndex]?.selectedAnswer === currentQuestion.correctAnswerIndex
                      const basePoints = parseFloat((1 + currentQuestion.difficulty).toFixed(2))
                      const difficultyBonus = parseFloat(currentQuestion.difficulty.toFixed(2))

                      // Calculate points using business logic service
                      const pointsEarned = calculatePlayerPointsForDisplay(
                        player,
                        index,
                        gameState.players,
                        turnPlayerIndex,
                        currentQuestion
                      )

                      // Count how many others got it right for explanation
                      const othersCorrect = isTurnPlayer
                        ? gameState.players.filter((p, i) => i !== index && p.selectedAnswer === currentQuestion.correctAnswerIndex).length
                        : gameState.players.filter((p, i) => i !== turnPlayerIndex && i !== index && p.selectedAnswer === currentQuestion.correctAnswerIndex).length

                      // Generate explanation with icons
                      const usedIKnow = player.usedIKnowThisRound
                      let explanation = ''

                      if (!isCorrect) {
                        if (usedIKnow && !isTurnPlayer) {
                          if (turnPlayerCorrect) {
                            explanation = '❌⚡ Wrong with I KNOW! (Turn player correct - no penalty)'
                          } else {
                            explanation = '❌⚡ Wrong with I KNOW! (DOUBLE penalty)'
                          }
                        } else {
                          explanation = '❌ Wrong answer'
                        }
                      } else if (isTurnPlayer) {
                        if (othersCorrect === 0) {
                          explanation = `⭐ Point for correct answer: 1 • Bonus for difficulty: ${difficultyBonus}`
                        } else {
                          const percentage = Math.round((1 - (pointsEarned / basePoints)) * 100)
                          explanation = `Point for correct answer: 1 • Bonus for difficulty: ${difficultyBonus} • ${othersCorrect} other${othersCorrect > 1 ? 's' : ''} also correct (-${percentage}%)`
                        }
                      } else {
                        if (!turnPlayerCorrect) {
                          if (usedIKnow) {
                            explanation = `⚡💎 I KNOW! bonus (2x points!) • Point: 1 • Bonus: ${difficultyBonus} • Doubled!`
                          } else if (othersCorrect === 0) {
                            explanation = `💎 Stole full points! • Point: 1 • Bonus: ${difficultyBonus}`
                          } else {
                            const percentage = Math.round((1 - (pointsEarned / basePoints)) * 100)
                            explanation = `Point: 1 • Bonus: ${difficultyBonus} • ${othersCorrect} other${othersCorrect > 1 ? 's' : ''} also stole (-${percentage}%)`
                          }
                        } else {
                          explanation = '🚫 Turn player was correct'
                        }
                      }
                      
                      return (
                        <div 
                          key={player.id}
                          className={cn(
                            "p-2 rounded",
                            player.id === gameState.currentPlayerId ? "bg-purple-600/30" : "bg-slate-800/30",
                            isTurnPlayer && "ring-2 ring-yellow-500/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isTurnPlayer && <span className="text-yellow-400">👑</span>}
                              <span className="text-sm mr-1">{getAvatarEmoji(player.avatar || (player.isAI ? 'robot' : 'default'))}</span>
                              <span className="text-white font-medium">{player.name}</span>
                              <span className={cn(
                                "text-xs px-2 py-1 rounded",
                                isCorrect ? "bg-green-600/30 text-green-300" : "bg-red-600/30 text-red-300"
                              )}>
                                {isCorrect ? '✓' : '✗'}
                              </span>
                              {player.selectedAnswer !== undefined && (
                                <span className="text-xs text-slate-400">
                                  ({String.fromCharCode(65 + player.selectedAnswer)})
                                </span>
                              )}
                            </div>
                            <span className={cn(
                              "font-bold",
                              pointsEarned > 0.001 ? "text-green-400" : pointsEarned < -0.001 ? "text-red-400" : "text-purple-300"
                            )}>
                              {Math.abs(pointsEarned) > 0.001 
                                ? (pointsEarned > 0 ? `+${pointsEarned.toFixed(2)}` : pointsEarned.toFixed(2))
                                : '—'
                              }
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 ml-6">
                            {explanation}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-sm text-slate-400 text-center mt-3">
                    Correct: {currentQuestion.answers[currentQuestion.correctAnswerIndex]}
                  </p>
                </div>
                <Button
                  onClick={nextQuestion}
                  className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {gameState.currentQuestionIndex < QUESTIONS_PER_GAME - 1 ? 'Next Round' : 'Finish Game'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
