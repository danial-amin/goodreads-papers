import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Flame, Target, TrendingUp, BookOpen, Compass, Layers,
  ArrowRight, ChevronRight, Zap, Award, Calendar,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Lightbulb, Sparkles, Brain, Eye, GraduationCap, Code, Quote
} from 'lucide-react'
import { useUser } from '../context/UserContext'
import api from '../services/api'

// Understanding level icons and colors
const UNDERSTANDING_CONFIG = {
  want_to_read: { icon: BookOpen, color: 'slate', label: 'Want to Read' },
  skimmed: { icon: Eye, color: 'yellow', label: 'Skimmed' },
  reading: { icon: BookOpen, color: 'blue', label: 'Reading' },
  read: { icon: Target, color: 'green', label: 'Read' },
  studied: { icon: GraduationCap, color: 'purple', label: 'Studied' },
  implemented: { icon: Code, color: 'indigo', label: 'Implemented' },
  cited: { icon: Quote, color: 'pink', label: 'Cited' },
}

const Dashboard = () => {
  const { currentUser } = useUser()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [habits, setHabits] = useState(null)
  const [exploreExploit, setExploreExploit] = useState(null)
  const [domainExpertise, setDomainExpertise] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    fetchDashboardData()
  }, [currentUser])

  const fetchDashboardData = async () => {
    try {
      const [habitsRes, exploreRes, domainRes] = await Promise.all([
        api.get(`/users/${currentUser.id}/reading-habits`),
        api.get(`/users/${currentUser.id}/explore-exploit`),
        api.get(`/users/${currentUser.id}/domain-expertise`),
      ])
      setHabits(habitsRes.data)
      setExploreExploit(exploreRes.data)
      setDomainExpertise(domainRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const getModeColor = (mode) => {
    switch (mode) {
      case 'exploring': return 'from-purple-500 to-pink-500'
      case 'exploiting': return 'from-blue-500 to-cyan-500'
      case 'balanced': return 'from-emerald-500 to-teal-500'
      default: return 'from-slate-500 to-slate-600'
    }
  }

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'exploring': return Compass
      case 'exploiting': return Layers
      case 'balanced': return Zap
      default: return Brain
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {currentUser?.name || currentUser?.username}
          </h1>
          <p className="text-slate-400">Here's your research reading overview</p>
        </motion.div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              {habits?.current_streak > 0 && (
                <span className="px-2 py-1 bg-orange-500/20 rounded-full text-xs text-orange-400 font-medium">
                  {habits.streak_status === 'on_track' ? 'On Fire!' : habits.streak_status === 'at_risk' ? 'Keep Going' : 'Start Today'}
                </span>
              )}
            </div>
            <p className="text-4xl font-bold text-white mb-1">{habits?.current_streak || 0}</p>
            <p className="text-sm text-slate-400">Week Streak</p>
            {habits?.longest_streak > 0 && (
              <p className="text-xs text-slate-500 mt-2">Best: {habits.longest_streak} weeks</p>
            )}
          </motion.div>

          {/* Weekly Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl p-6 border border-blue-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">
                {habits?.papers_this_week || 0}/{habits?.weekly_goal || 3}
              </span>
            </div>
            <div className="mb-2">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${habits?.week_progress_percent || 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-400">Weekly Goal Progress</p>
          </motion.div>

          {/* Papers This Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-6 border border-emerald-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>{habits?.avg_papers_per_week || 0}/wk</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{habits?.papers_last_30_days || 0}</p>
            <p className="text-sm text-slate-400">Papers This Month</p>
          </motion.div>

          {/* Expertise Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1 capitalize">
              {domainExpertise?.expertise_level || 'Novice'}
            </p>
            <p className="text-sm text-slate-400">
              {domainExpertise?.total_domains || 0} domains explored
            </p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Explore/Exploit Advisor - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                Research Mode Advisor
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getModeColor(exploreExploit?.current_mode)} text-white`}>
                {exploreExploit?.current_mode === 'exploring' ? 'Exploring' :
                 exploreExploit?.current_mode === 'exploiting' ? 'Going Deep' : 'Balanced'}
              </span>
            </div>

            {/* Mode Visualization */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="#334155" strokeWidth="8" fill="none" />
                    <circle
                      cx="40" cy="40" r="36"
                      stroke="url(#diversityGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(exploreExploit?.domain_diversity_score || 0) * 226} 226`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="diversityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                    {Math.round((exploreExploit?.domain_diversity_score || 0) * 100)}%
                  </span>
                </div>
                <p className="text-sm text-slate-400">Diversity</p>
              </div>

              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="#334155" strokeWidth="8" fill="none" />
                    <circle
                      cx="40" cy="40" r="36"
                      stroke="url(#depthGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(exploreExploit?.depth_score || 0) * 226} 226`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="depthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                    {Math.round((exploreExploit?.depth_score || 0) * 100)}%
                  </span>
                </div>
                <p className="text-sm text-slate-400">Depth</p>
              </div>

              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2 flex items-center justify-center bg-slate-700/50 rounded-full">
                  <span className="text-2xl font-bold text-white">{exploreExploit?.breadth_score || 0}</span>
                </div>
                <p className="text-sm text-slate-400">Domains</p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">
                    {exploreExploit?.recommendation === 'go_deep' ? 'Time to Go Deep' :
                     exploreExploit?.recommendation === 'explore_adjacent' ? 'Explore Adjacent Fields' :
                     exploreExploit?.recommendation === 'cross_pollinate' ? 'Cross-Pollinate Your Knowledge' :
                     exploreExploit?.recommendation === 'maintain_balance' ? 'Great Balance!' :
                     'Build Your Foundation'}
                  </p>
                  <p className="text-sm text-slate-400">{exploreExploit?.recommendation_reason}</p>
                </div>
              </div>
            </div>

            {/* Suggested Actions */}
            {exploreExploit?.suggested_actions?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-400 mb-2">Suggested Actions</p>
                {exploreExploit.suggested_actions.slice(0, 2).map((action, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full ${
                      action.priority === 'high' ? 'bg-red-400' :
                      action.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`} />
                    <span className="text-slate-300">{action.action}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Domain Expertise Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Domain Expertise
            </h2>

            {/* Simple bar chart for domains */}
            <div className="space-y-3">
              {domainExpertise?.domains?.slice(0, 6).map((domain, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{domain.name}</span>
                    <span className="text-slate-500">{domain.papers_count} papers</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${domain.value * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.1 * i }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {domainExpertise?.strong_areas?.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Strong Areas</p>
                <div className="flex flex-wrap gap-2">
                  {domainExpertise.strong_areas.map((area, i) => (
                    <span key={i} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Understanding Breakdown & Weekly History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Understanding Levels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Understanding Depth
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(habits?.understanding_breakdown || {}).map(([status, count]) => {
                const config = UNDERSTANDING_CONFIG[status] || { icon: BookOpen, color: 'slate', label: status }
                const Icon = config.icon
                return (
                  <div
                    key={status}
                    className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl"
                  >
                    <div className={`p-2 bg-${config.color}-500/20 rounded-lg`}>
                      <Icon className={`w-4 h-4 text-${config.color}-400`} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{count}</p>
                      <p className="text-xs text-slate-400">{config.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Weekly History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-400" />
              Reading Activity
            </h2>

            <div className="flex items-end justify-between h-32 gap-1">
              {habits?.weekly_history?.slice(-12).map((week, i) => {
                const maxCount = Math.max(...(habits?.weekly_history?.map(w => w.count) || [1]))
                const height = maxCount > 0 ? (week.count / maxCount) * 100 : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <motion.div
                      className="w-full bg-gradient-to-t from-teal-500 to-emerald-400 rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ duration: 0.5, delay: 0.05 * i }}
                    />
                    <span className="text-[10px] text-slate-500 mt-2 rotate-45 origin-left">
                      {week.week.split('-W')[1]}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Insights & Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits?.habit_insights?.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-xl">
                <div className="p-1 bg-blue-500/20 rounded">
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-sm text-slate-300">{insight}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 mt-6 pt-6 border-t border-slate-700">
            <Link
              to="/papers"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Find Papers
            </Link>
            <Link
              to="/recommendations"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Get Recommendations
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
