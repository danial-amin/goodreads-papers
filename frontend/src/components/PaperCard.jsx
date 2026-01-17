import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Users, ExternalLink, TrendingUp } from 'lucide-react'

const PaperCard = ({ paper, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/papers/${paper.id}`}>
        <div className="card p-6 h-full cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {paper.title}
            </h3>
            {paper.citation_count > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span>{paper.citation_count}</span>
              </div>
            )}
          </div>

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

export default PaperCard
