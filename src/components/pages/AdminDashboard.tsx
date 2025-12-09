import { useEffect, useState } from "react"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { getAllQuestionsForAdmin, getAdminQuestionStats, removeQuestion, deleteAllUsers, type AdminQuestionStats } from "@/lib/services/adminService"
import { calculateConfidence } from "@/lib/services"
import { cn, getDifficultyColorClasses, QUIZ_DIFFICULTY_LEVELS, getCategoryEmoji, getCategoryColorClasses, getDifficultyEmoji, STATUS_EMOJIS } from "@/lib/utils"
import type { Question, QuestionCategory } from "@/lib/utils"

interface AdminDashboardProps {
  onExit: () => void
}

type SortField = 'question' | 'category' | 'difficulty' | 'collection' | 'class'
type SortOrder = 'asc' | 'desc'

interface FilterState {
  collection: string | null
  class: string | null
  category: QuestionCategory | null
  difficulty: 'all' | 'easy' | 'medium' | 'hard' | 'expert'
}

interface SortState {
  field: SortField
  order: SortOrder
}

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<AdminQuestionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [isDeletingUsers, setIsDeletingUsers] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    collection: null,
    class: null,
    category: null,
    difficulty: 'all'
  })
  const [sort, setSort] = useState<SortState>({
    field: 'question',
    order: 'asc'
  })

  // Get unique collections and classes from questions
  const uniqueCollections = Array.from(
    new Set(questions.flatMap(q => q.questionCollection || []))
  ).sort()
  const uniqueClasses = Array.from(
    new Set(questions.flatMap(q => q.questionClass || []))
  ).sort()

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

  // Handle delete all users
  const handleDeleteAllUsers = async () => {
    try {
      setIsDeletingUsers(true)
      setError(null)
      const result = await deleteAllUsers()
      
      if (result.success) {
        alert(`Successfully deleted ${result.deletedCount} user(s)`)
      } else {
        setError(result.error || 'Failed to delete users')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete users')
      console.error('Error deleting users:', err)
    } finally {
      setIsDeletingUsers(false)
    }
  }

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

  // Filter and sort questions
  const filteredAndSortedQuestions = questions
    .filter(q => {
      if (filters.collection && !q.questionCollection?.includes(filters.collection)) return false
      if (filters.class && !q.questionClass?.includes(filters.class as any)) return false
      if (filters.category && !q.categories?.includes(filters.category)) return false
      if (filters.difficulty !== 'all') {
        const level = QUIZ_DIFFICULTY_LEVELS.find(l => q.difficulty <= l.max)?.category.toLowerCase()
        if (level !== filters.difficulty) return false
      }
      return true
    })
    .sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''

      switch (sort.field) {
        case 'question':
          aVal = a.question.toLowerCase()
          bVal = b.question.toLowerCase()
          break
        case 'category':
          aVal = (a.categories?.[0] || '').toLowerCase()
          bVal = (b.categories?.[0] || '').toLowerCase()
          break
        case 'difficulty':
          aVal = a.difficulty
          bVal = b.difficulty
          break
        case 'collection':
          aVal = (a.questionCollection?.[0] || '').toLowerCase()
          bVal = (b.questionCollection?.[0] || '').toLowerCase()
          break
        case 'class':
          aVal = (a.questionClass?.[0] || '').toLowerCase()
          bVal = (b.questionClass?.[0] || '').toLowerCase()
          break
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sort.order === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

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
          <div className="flex gap-3">
            <Button 
              onClick={handleDeleteAllUsers}
              disabled={isDeletingUsers}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingUsers ? 'Deleting...' : 'Delete All Users'}
            </Button>
            <Button 
              onClick={onExit}
              variant="outline"
              className="border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Back to Menu
            </Button>
          </div>
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

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-purple-300">Questions by Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uniqueCollections.length > 0 ? (
                    uniqueCollections.map((collection) => {
                      const count = questions.filter(q => q.questionCollection?.includes(collection)).length
                      return (
                        <div key={collection} className="flex justify-between text-sm text-slate-300">
                          <span>{collection}</span>
                          <span className="font-semibold text-blue-400">{count}</span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-sm text-slate-500">No collections</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-purple-300">Questions by Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uniqueClasses.length > 0 ? (
                    uniqueClasses.map((questionClass) => {
                      const count = questions.filter(q => q.questionClass?.includes(questionClass)).length
                      return (
                        <div key={questionClass} className="flex justify-between text-sm text-slate-300">
                          <span>{questionClass}</span>
                          <span className="font-semibold text-cyan-400">{count}</span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-sm text-slate-500">No classes</div>
                  )}
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
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-2xl text-white">Question Database</CardTitle>
              <div className="flex gap-2 text-sm text-slate-400">
                <span>{filteredAndSortedQuestions.length} / {questions.length} shown</span>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Collection Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Collection</label>
                <select
                  value={filters.collection || 'all'}
                  onChange={(e) => setFilters({ ...filters, collection: e.target.value === 'all' ? null : e.target.value })}
                  className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All</option>
                  {uniqueCollections.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Class Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Class</label>
                <select
                  value={filters.class || 'all'}
                  onChange={(e) => setFilters({ ...filters, class: e.target.value === 'all' ? null : e.target.value })}
                  className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Category</label>
                <select
                  value={filters.category || 'all'}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value === 'all' ? null : (e.target.value as QuestionCategory) })}
                  className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All</option>
                  {Array.from(new Set(questions.flatMap(q => q.categories))).sort().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value as typeof filters.difficulty })}
                  className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Reset Button */}
              <div className="flex flex-col gap-1 justify-end">
                <Button
                  onClick={() => setFilters({ collection: null, class: null, category: null, difficulty: 'all' })}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-400 hover:bg-slate-700 h-8"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAndSortedQuestions.length === 0 ? (
              <div className="text-slate-400 text-center py-12">No questions match your filters</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">#</th>
                      <th 
                        className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-purple-300"
                        onClick={() => setSort({ field: 'question', order: sort.field === 'question' && sort.order === 'asc' ? 'desc' : 'asc' })}
                      >
                        Question {sort.field === 'question' && (sort.order === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28 cursor-pointer hover:text-purple-300"
                        onClick={() => setSort({ field: 'category', order: sort.field === 'category' && sort.order === 'asc' ? 'desc' : 'asc' })}
                      >
                        Category {sort.field === 'category' && (sort.order === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24 cursor-pointer hover:text-purple-300"
                        onClick={() => setSort({ field: 'collection', order: sort.field === 'collection' && sort.order === 'asc' ? 'desc' : 'asc' })}
                      >
                        Collection {sort.field === 'collection' && (sort.order === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-20 cursor-pointer hover:text-purple-300"
                        onClick={() => setSort({ field: 'class', order: sort.field === 'class' && sort.order === 'asc' ? 'desc' : 'asc' })}
                      >
                        Class {sort.field === 'class' && (sort.order === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28 cursor-pointer hover:text-purple-300"
                        onClick={() => setSort({ field: 'difficulty', order: sort.field === 'difficulty' && sort.order === 'asc' ? 'desc' : 'asc' })}
                      >
                        Difficulty {sort.field === 'difficulty' && (sort.order === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">Stats</th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredAndSortedQuestions.map((question, idx) => (
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
                              {STATUS_EMOJIS.correct} CORRECT: {String.fromCharCode(65 + question.correctAnswerIndex)}. {question.answers[question.correctAnswerIndex]}
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
                                <span key={cat} className={cn("text-xs px-2 py-1 rounded", getCategoryColorClasses(cat))}>
                                  {getCategoryEmoji(cat)} {cat}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {question.questionCollection && question.questionCollection.length > 0 ? (
                              question.questionCollection.map((col) => (
                                <span key={col} className="text-xs px-2 py-1 rounded bg-blue-600/30 text-blue-300 whitespace-nowrap">
                                  {col}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {question.questionClass && question.questionClass.length > 0 ? (
                              question.questionClass.map((cls) => (
                                <span key={cls} className="text-xs px-2 py-1 rounded bg-cyan-600/30 text-cyan-300 whitespace-nowrap">
                                  {cls}
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
                              {getDifficultyEmoji(question.difficulty)} {QUIZ_DIFFICULTY_LEVELS.find(l => question.difficulty <= l.max)?.category || 'Unknown'}
                            </span>
                            <span className="text-xs text-slate-500 text-center font-mono">
                              {question.difficulty.toFixed(3)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1 text-xs text-slate-300">
                            <div className="flex items-center justify-center gap-2">
                              <span>{STATUS_EMOJIS.correct} {question.correctCount || 0}</span>
                              <span>{STATUS_EMOJIS.incorrect} {question.incorrectCount || 0}</span>
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
