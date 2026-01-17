import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Users, ExternalLink, TrendingUp, ArrowRight } from 'lucide-react'

const PaperCard = ({ paper, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/papers/${paper.id}`}>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 h-full cursor-pointer group hover:border-slate-600 transition-all">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 flex-1 pr-2">
              {paper.title}
            </h3>
            {paper.citation_count > 0 && (
              <div className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full shrink-0">
                <TrendingUp className="w-3 h-3" />
                <span>{paper.citation_count}</span>
              </div>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-3 text-sm text-slate-400 mb-3">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="truncate max-w-[180px]">{paper.authors}</span>
            </div>
            {paper.year && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{paper.year}</span>
              </div>
            )}
          </div>

          {paper.venue && (
            <p className="text-sm text-blue-400 font-medium mb-3">{paper.venue}</p>
          )}

          <p className="text-slate-400 text-sm line-clamp-3 mb-4 leading-relaxed">{paper.abstract}</p>

          {paper.keywords && (
            <div className="flex flex-wrap gap-2 mb-4">
              {paper.keywords.split(',').slice(0, 3).map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg border border-blue-500/20"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            {paper.domains && (
              <span className="text-xs text-slate-500">
                {paper.domains.split(',')[0]?.trim()}
              </span>
            )}
            <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default PaperCard
