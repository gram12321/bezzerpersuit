import { useEffect, useState } from "react"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { getAllQuestionsForAdmin, getAdminQuestionStats, removeQuestion, type AdminQuestionStats } from "@/lib/services/adminService"
import { calculateConfidence } from "@/lib/services"
import { cn, getDifficultyColorClasses, QUIZ_DIFFICULTY_LEVELS } from "@/lib/utils/utils"
import type { Question } from "@/lib/utils/types"

interface AdminDashboardProps {
  onExit: () => void
}

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<AdminQuestionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [questionsData, statsData] = await Promise.all([
          getAllQuestionsForAdmin(),
          getAdminQuestionStats(),
        ])
        setQuestions(questionsData)
        setStats(statsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data')
        console.error('Error loading admin data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

  // Handle delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const updatedQuestions = await removeQuestion(questionId)
      setQuestions(updatedQuestions)
      setSelectedQuestion(null)

      // Refresh stats
      const newStats = await getAdminQuestionStats()
      setStats(newStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
      console.error('Error deleting question:', err)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-2xl w-full">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="text-purple-400 text-lg animate-pulse">
                Loading admin dashboard...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-purple-200 mt-2">Manage quiz questions and view statistics</p>
          </div>
          <Button 
            onClick={onExit}
            variant="outline"
            className="border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Back to Menu
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="pt-6">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-purple-300">Total Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">{stats.totalQuestions}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-purple-300">Questions by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.questionsByCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between text-sm text-slate-300">
                      <span>{category}</span>
                      <span className="font-semibold text-purple-400">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg text-purple-300">Difficulty Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(stats.difficultyDistribution).map(([difficulty, count]) => (
                    <div key={difficulty} className="text-center">
                      <div className="text-2xl font-bold text-white">{count}</div>
                      <div className="text-xs text-slate-400 mt-1">{difficulty}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg text-purple-300">Category × Difficulty Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-slate-400 font-semibold sticky left-0 bg-slate-800/50">Category</th>
                        {QUIZ_DIFFICULTY_LEVELS.map(level => (
                          <th key={level.category} className="text-center p-2 text-slate-400 font-semibold whitespace-nowrap">
                            {level.category}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(stats.questionsByCategory).sort().map(category => (
                        <tr key={category} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="p-2 text-slate-300 font-medium sticky left-0 bg-slate-800/50">
                            {category}
                          </td>
                          {QUIZ_DIFFICULTY_LEVELS.map(level => {
                            const count = stats.categoryDifficultyMatrix[category]?.[level.category] || 0
                            return (
                              <td key={level.category} className="text-center p-2">
                                <span className={cn(
                                  "inline-block w-8 h-8 rounded items-center justify-center font-semibold",
                                  count > 0 ? "bg-purple-600/30 text-purple-300" : "bg-slate-700/20 text-slate-600"
                                )}>
                                  {count || '−'}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Questions Database */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-white">Question Database</CardTitle>
              <div className="flex gap-2 text-sm text-slate-400">
                <span>{questions.length} total</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {questions.length === 0 ? (
              <div className="text-slate-400 text-center py-12">No questions found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">#</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Question</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">Category</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Difficulty</th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">Stats</th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {questions.map((question, idx) => (
                      <tr 
                        key={question.id}
                        className={cn(
                          "transition-colors",
                          selectedQuestion === question.id ? "bg-purple-900/30" : "hover:bg-slate-700/30"
                        )}
                      >
                        <td className="p-3">
                          <div className="text-slate-500 font-mono text-sm">{idx + 1}</div>
                        </td>
                        <td className="p-3">
                          <div 
                            className="cursor-pointer"
                            onClick={() => setSelectedQuestion(selectedQuestion === question.id ? null : question.id)}
                          >
                            <div className="text-white font-medium mb-1 hover:text-purple-300 transition-colors">
                              {question.question}
                            </div>
                            <div className="text-sm mt-2 bg-green-900/50 text-green-300 font-bold px-3 py-1 rounded inline-block">
                              ✓ CORRECT: {String.fromCharCode(65 + question.correctAnswerIndex)}. {question.answers[question.correctAnswerIndex]}
                            </div>
                            {selectedQuestion === question.id && (
                              <div className="mt-2 space-y-1 text-xs">
                                {question.answers.map((answer: string, answerIdx: number) => (
                                  <div
                                    key={answerIdx}
                                    className={cn(
                                      "p-2 rounded",
                                      answerIdx === question.correctAnswerIndex
                                        ? "bg-green-900/30 text-green-300"
                                        : "bg-slate-700/30 text-slate-400"
                                    )}
                                  >
                                    {String.fromCharCode(65 + answerIdx)}. {answer}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {question.categories && question.categories.length > 0 ? (
                              question.categories.map((cat) => (
                                <span key={cat} className="text-xs px-2 py-1 rounded bg-purple-600/30 text-purple-300">
                                  {cat}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded font-semibold text-center",
                              getDifficultyColorClasses(question.difficulty)
                            )}>
                              {QUIZ_DIFFICULTY_LEVELS.find(l => question.difficulty <= l.max)?.category || 'Unknown'}
                            </span>
                            <span className="text-xs text-slate-500 text-center font-mono">
                              {question.difficulty.toFixed(3)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1 text-xs text-slate-300">
                            <div className="flex items-center justify-center gap-2">
                              <span>✓ {question.correctCount || 0}</span>
                              <span>✗ {question.incorrectCount || 0}</span>
                            </div>
                            <div className="text-center text-slate-400 font-mono">
                              {(() => {
                                const total = (question.correctCount || 0) + (question.incorrectCount || 0)
                                if (total === 0) return "−"
                                const conf = calculateConfidence(
                                  total,
                                  question.recentHistory || [],
                                  question.difficulty
                                )
                                return `${(conf * 100).toFixed(0)}%`
                              })()}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedQuestion(selectedQuestion === question.id ? null : question.id)
                              }}
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 border-slate-600 hover:bg-purple-600/20 hover:border-purple-500"
                            >
                              {selectedQuestion === question.id ? "−" : "+"}
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteQuestion(question.id)
                              }}
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 border-slate-600 hover:bg-red-600/20 hover:border-red-500"
                            >
                              ×
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
