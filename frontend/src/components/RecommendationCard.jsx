import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Users, ExternalLink, TrendingUp, Sparkles } from 'lucide-react'

const RecommendationCard = ({ recommendation, delay = 0 }) => {
  const paper = recommendation.paper
  const score = recommendation.score

  // Calculate score percentage for visual representation
  const scorePercentage = Math.min(score * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/papers/${paper.id}`}>
        <div className="card p-6 h-full cursor-pointer group relative overflow-hidden">
          {/* Recommendation badge */}
          <div className="absolute top-4 right-4 flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Recommended</span>
          </div>

          {/* Score indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Relevance Score</span>
              <span className="text-sm font-bold text-blue-600">{scorePercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scorePercentage}%` }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{recommendation.reason}</p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-4">
            {paper.title}
          </h3>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{paper.authors}</span>
            </div>
            {paper.year && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{paper.year}</span>
              </div>
            )}
          </div>

          {paper.venue && (
            <p className="text-sm text-blue-600 font-medium mb-3">{paper.venue}</p>
          )}

          <p className="text-gray-600 text-sm line-clamp-3 mb-4">{paper.abstract}</p>

          {paper.keywords && (
            <div className="flex flex-wrap gap-2 mb-4">
              {paper.keywords.split(',').slice(0, 3).map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          )}

          {paper.url && (
            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:underline">
              <ExternalLink className="w-4 h-4 mr-1" />
              View Paper
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default RecommendationCard
