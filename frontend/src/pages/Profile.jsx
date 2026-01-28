import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, BookOpen, TrendingUp, Calendar, Star, BarChart3, Lightbulb } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

const Profile = () => {
  const { currentUser, authToken } = useUser()
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    fetchProfile()
  }, [currentUser])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      const data = await response.json()
      setProfileData(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentUser || !profileData) {
    return null
  }

  const { user, reading_stats, insights } = profileData

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-8"
        >
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {user.name || user.username}
              </h1>
              <p className="text-gray-600 mb-4">@{user.username}</p>
              {user.research_interests && (
                <div className="flex flex-wrap gap-2">
                  {user.research_interests.split(',').map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                    >
                      {interest.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Reading Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">
                {reading_stats.total_papers}
              </span>
            </div>
            <p className="text-gray-600">Total Papers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">
                {reading_stats.read_count}
              </span>
            </div>
            <p className="text-gray-600">Papers Read</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-900">
                {reading_stats.favorite_count}
              </span>
            </div>
            <p className="text-gray-600">Favorites</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">
                {reading_stats.reading_velocity}
              </span>
            </div>
            <p className="text-gray-600">Papers/Month</p>
          </motion.div>
        </div>

        {/* Insights */}
        {insights && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6 mb-8"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Reading Insights</h2>
            </div>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Favorite Domains & Venues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {reading_stats.favorite_domains.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Favorite Domains</h3>
              <div className="flex flex-wrap gap-2">
                {reading_stats.favorite_domains.map((domain, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {reading_stats.favorite_venues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Favorite Venues</h3>
              <div className="flex flex-wrap gap-2">
                {reading_stats.favorite_venues.map((venue, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full font-medium"
                  >
                    {venue}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Top Keywords */}
        {reading_stats.top_keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Top Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {reading_stats.top_keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Profile
