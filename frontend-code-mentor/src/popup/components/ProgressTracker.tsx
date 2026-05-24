import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Calendar,
  Zap,
  BookOpen,
  Lightbulb
} from 'lucide-react'
import { useExtensionState } from '../hooks/useExtensionState'

interface ProgressStats {
  totalProblems: number
  solvedProblems: number
  totalAttempts: number
  totalTimeSpent: number
  hintsUsed: number
  streak: number
  averageAttempts: number
  successRate: number
}

interface ProblemProgress {
  id: string
  title: string
  attempts: number
  hintsUsed: number[]
  timeSpent: number
  lastAttempt: number
  solved: boolean
  difficulty: string
}

const ProgressTracker: React.FC = () => {
  const { progress } = useExtensionState()
  const [stats, setStats] = useState<ProgressStats>({
    totalProblems: 0,
    solvedProblems: 0,
    totalAttempts: 0,
    totalTimeSpent: 0,
    hintsUsed: 0,
    streak: 0,
    averageAttempts: 0,
    successRate: 0
  })
  const [recentProblems, setRecentProblems] = useState<ProblemProgress[]>([])
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    calculateStats()
    loadRecentProblems()
  }, [progress, timeRange])

  const calculateStats = () => {
    const problems = Object.values(progress)
    const totalProblems = problems.length
    const solvedProblems = problems.filter(p => p.solved).length
    const totalAttempts = problems.reduce((sum, p) => sum + p.attempts, 0)
    const totalTimeSpent = problems.reduce((sum, p) => sum + p.timeSpent, 0)
    const hintsUsed = problems.reduce((sum, p) => sum + p.hintsUsed.length, 0)
    const averageAttempts = totalProblems > 0 ? totalAttempts / totalProblems : 0
    const successRate = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0

    setStats({
      totalProblems,
      solvedProblems,
      totalAttempts,
      totalTimeSpent,
      hintsUsed,
      streak: calculateStreak(),
      averageAttempts,
      successRate
    })
  }

  const calculateStreak = () => {
    // Simple streak calculation - in real app, this would be more sophisticated
    const problems = Object.values(progress)
    return problems.filter(p => p.solved).length
  }

  const loadRecentProblems = () => {
    const problems = Object.entries(progress)
      .map(([id, data]) => ({
        id,
        title: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        ...data
      }))
      .sort((a, b) => b.lastAttempt - a.lastAttempt)
      .slice(0, 5)

    setRecentProblems(problems)
  }

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }



  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
            Progress Overview
          </h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'all')}
            className="text-sm font-medium border border-zinc-300 dark:border-zinc-700 rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 outline-none transition-shadow"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 p-3.5 rounded-xl shadow-sm"
          >
            <div className="flex items-center space-x-2 mb-1.5">
              <Target className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Problems</span>
            </div>
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {stats.solvedProblems}/{stats.totalProblems}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
              {stats.totalProblems > 0 ? Math.round(stats.successRate) : 0}% success rate
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 p-3.5 rounded-xl shadow-sm"
          >
            <div className="flex items-center space-x-2 mb-1.5">
              <Zap className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Streak</span>
            </div>
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {stats.streak}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
              days in a row
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 p-3.5 rounded-xl shadow-sm"
          >
            <div className="flex items-center space-x-2 mb-1.5">
              <BarChart3 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Attempts</span>
            </div>
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {stats.totalAttempts}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
              avg {stats.averageAttempts.toFixed(1)} per problem
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 p-3.5 rounded-xl shadow-sm"
          >
            <div className="flex items-center space-x-2 mb-1.5">
              <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Time</span>
            </div>
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {formatTime(stats.totalTimeSpent)}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
              total coding time
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Overall Progress
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {stats.solvedProblems} of {stats.totalProblems}
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.totalProblems > 0 ? (stats.solvedProblems / stats.totalProblems) * 100 : 0}%` }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Recent Problems */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
          Recent Activity
        </h3>

        {recentProblems.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              No Progress Yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Start solving problems to track your progress
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentProblems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                    {problem.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {problem.solved ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-600 dark:text-zinc-400`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5" />
                      <span>{problem.attempts}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{problem.hintsUsed.length}</span>
                    </span>
                  </div>
                  <span className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(problem.lastAttempt)}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { ProgressTracker }
