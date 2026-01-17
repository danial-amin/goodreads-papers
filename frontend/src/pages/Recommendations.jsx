import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import RecommendationCard from '../components/RecommendationCard'
import { recommendationsAPI } from '../services/api'
import { useUser } from '../context/UserContext'
import { Sparkles, Loader2 } from 'lucide-react'

const Recommendations = () => {
  const { currentUser } = useUser()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (currentUser) {
      fetchRecommendations()
    }
  }, [currentUser])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const response = await recommendationsAPI.getForUser(currentUser.id, 12)
      setRecommendations(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError('Failed to load recommendations. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Your Recommendations</h1>
          </div>
          <p className="text-gray-600">
            Papers tailored to your interests and reading history
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Recommendations Grid */}
        {!loading && !error && (
          <>
            {recommendations.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">
                  No recommendations available yet.
                </p>
                <p className="text-gray-500">
                  Start reading and rating papers to get personalized recommendations!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec, index) => (
                  <RecommendationCard
                    key={rec.paper.id}
                    recommendation={rec}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Recommendations
