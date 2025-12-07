import { Button } from "@/components/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
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

        {/* Game Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Single Player */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Solo Practice</CardTitle>
              <CardDescription className="text-purple-200">
                Play against AI opponents and sharpen your skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Multiple difficulty levels</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Practice without pressure</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Improve your ranking</span>
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Start Practice
              </Button>
            </CardContent>
          </Card>

          {/* Multiplayer */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Multiplayer</CardTitle>
              <CardDescription className="text-purple-200">
                Challenge real players in real-time battles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Real-time competition</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Climb the leaderboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Earn achievements</span>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Find Match
              </Button>
            </CardContent>
          </Card>
        </div>

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
        <div className="flex gap-4 justify-center">
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
            Sign In
          </Button>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
