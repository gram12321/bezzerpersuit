import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { useGameState } from "@/hooks"
import { cn, formatDifficulty, getDifficultyColorClasses } from "@/lib/utils/utils"
import type { LobbyState } from '@/lib/utils/types'

interface GameAreaProps {
  lobby: LobbyState
  onExit: () => void
}

export function GameArea({ lobby, onExit }: GameAreaProps) {
  const { gameState, startGame, submitAnswer, nextQuestion, endGame } = useGameState(lobby)

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
              <p className="text-purple-200 text-lg">
                Ready to test your knowledge?
              </p>
              <div className="space-y-2 text-sm text-slate-300">
                <p>• Answer questions as fast as you can</p>
                <p>• Faster answers = more points</p>
                <p>• 15 seconds per question</p>
                <p>• Compete against {gameState.players.length - 1} opponent{gameState.players.length > 2 ? 's' : ''}</p>
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
                    <div className="text-white font-medium">
                      {player.name}
                      {player.isAI && ' 🤖'}
                    </div>
                  </div>
                  <div className="text-purple-300 font-bold">
                    {player.score}
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-6">
        {/* Players Leaderboard */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gameState.players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                <div 
                  key={player.id}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg",
                    player.id === gameState.currentPlayerId 
                      ? "bg-purple-600/30 border border-purple-500/50" 
                      : "bg-slate-700/30"
                  )}
                >
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
                      {player.name}
                      {player.isAI && ' 🤖'}
                    </div>
                    <div className="text-xs text-slate-400">{player.score} pts</div>
                  </div>
                </div>
              ))}
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
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-purple-600/30 text-purple-300">
                    {currentQuestion.category}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    getDifficultyColorClasses(currentQuestion.difficulty)
                  )}>
                    {formatDifficulty(currentQuestion.difficulty)}
                  </span>
                </div>
                <CardTitle className="text-2xl text-white">
                  {currentQuestion.question}
                </CardTitle>
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
          <CardContent className="space-y-3">
            {currentQuestion.answers.map((answer, index) => (
              <Button
                key={index}
                onClick={() => !gameState.showResult && submitAnswer(index)}
                disabled={gameState.showResult}
                className={cn(
                  "w-full justify-start text-left h-auto py-4 px-6 text-base",
                  !gameState.showResult && "bg-slate-700 hover:bg-slate-600 text-white",
                  gameState.showResult && index === currentQuestion.correctAnswerIndex && "bg-green-600 hover:bg-green-600 text-white",
                  gameState.showResult && index === gameState.selectedAnswer && index !== currentQuestion.correctAnswerIndex && "bg-red-600 hover:bg-red-600 text-white",
                  gameState.showResult && index !== currentQuestion.correctAnswerIndex && index !== gameState.selectedAnswer && "bg-slate-700/50 text-slate-400"
                )}
              >
                <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                {answer}
              </Button>
            ))}

            {gameState.showResult && (
              <div className="pt-4">
                <div className={cn(
                  "p-4 rounded-lg text-center",
                  gameState.isCorrect ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"
                )}>
                  <p className="font-bold text-lg">
                    {gameState.isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
                  </p>
                  <p className="text-sm mt-1">
                    {gameState.isCorrect 
                      ? '+1 point' 
                      : `Correct answer: ${currentQuestion.answers[currentQuestion.correctAnswerIndex]}`
                    }
                  </p>
                </div>
                <Button
                  onClick={nextQuestion}
                  className="w-full mt-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {gameState.currentQuestionIndex < gameState.questions.length - 1 ? 'Next Question' : 'Finish Game'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
