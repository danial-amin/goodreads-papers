import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { papersAPI, interactionsAPI } from '../services/api'
import { useUser } from '../context/UserContext'
import PaperCard from '../components/PaperCard'
import PaperReflectionModal from '../components/PaperReflectionModal'
import {
  Calendar,
  Users,
  ExternalLink,
  TrendingUp,
  BookOpen,
  Star,
  ArrowLeft,
} from 'lucide-react'

const PaperDetail = () => {
  const { id } = useParams()
  const { currentUser } = useUser()
  const [paper, setPaper] = useState(null)
  const [similarPapers, setSimilarPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [status, setStatus] = useState('want_to_read')
  const [showReflectionModal, setShowReflectionModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)

  useEffect(() => {
    fetchPaper()
    fetchSimilarPapers()
  }, [id])

  const fetchPaper = async () => {
    try {
      setLoading(true)
      const response = await papersAPI.getById(id)
      setPaper(response.data)
    } catch (err) {
      console.error('Error fetching paper:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarPapers = async () => {
    try {
      const response = await papersAPI.getSimilar(id, 3)
      setSimilarPapers(response.data)
    } catch (err) {
      console.error('Error fetching similar papers:', err)
    }
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    // If marking as read, show reflection modal
    if (newStatus === 'read') {
      setPendingStatus(newStatus)
      setShowReflectionModal(true)
    } else {
      // For other statuses, save immediately
      handleInteraction(newStatus)
    }
  }

  const handleReflectionSubmit = async (reflectionData) => {
    if (!currentUser) return
    
    setShowReflectionModal(false)
    
    try {
      await interactionsAPI.create({
        user_id: currentUser.id,
        paper_id: parseInt(id),
        rating: rating > 0 ? rating : null,
        status: pendingStatus || status,
        ...reflectionData
      })
      alert('Paper marked as read and reflection saved!')
      setPendingStatus(null)
    } catch (err) {
      console.error('Error saving interaction:', err)
      alert('Failed to save interaction')
    }
  }

  const handleInteraction = async (statusToUse = null) => {
    if (!currentUser) return

    try {
      await interactionsAPI.create({
        user_id: currentUser.id,
        paper_id: parseInt(id),
        rating: rating > 0 ? rating : null,
        status: statusToUse || status,
      })
      alert('Interaction saved!')
    } catch (err) {
      console.error('Error saving interaction:', err)
      alert('Failed to save interaction')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Paper not found</p>
          <Link to="/papers" className="btn-primary">
            Back to Papers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/papers"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Papers
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{paper.title}</h1>
              <div className="flex items-center space-x-6 text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span className="text-lg">{paper.authors}</span>
                </div>
                {paper.year && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>{paper.year}</span>
                  </div>
                )}
                {paper.citation_count > 0 && (
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>{paper.citation_count} citations</span>
                  </div>
                )}
              </div>
              {paper.venue && (
                <p className="text-blue-600 font-semibold text-lg mb-4">{paper.venue}</p>
              )}
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Abstract</h2>
            <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
          </div>

          {paper.keywords && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.split(',').map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center btn-primary"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View Full Paper
            </a>
          )}

          {/* Interaction Section */}
          {currentUser && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Track This Paper</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="want_to_read">Want to Read</option>
                    <option value="reading">Reading</option>
                    <option value="read">Read</option>
                    <option value="favorite">Favorite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`${
                          star <= rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => handleInteraction()} className="btn-primary">
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Reflection Modal */}
          <PaperReflectionModal
            isOpen={showReflectionModal}
            onClose={() => {
              setShowReflectionModal(false)
              setPendingStatus(null)
            }}
            paper={paper}
            onSubmit={handleReflectionSubmit}
          />
        </motion.div>

        {/* Similar Papers */}
        {similarPapers.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Similar Papers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarPapers.map((similarPaper, index) => (
                <PaperCard key={similarPaper.id} paper={similarPaper} delay={index * 0.1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaperDetail
