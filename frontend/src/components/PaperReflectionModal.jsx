import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, CheckCircle, Target } from 'lucide-react'

const PaperReflectionModal = ({ isOpen, onClose, paper, onSubmit }) => {
  const [formData, setFormData] = useState({
    what_is_about: '',
    is_relevant: '',
    where_can_use: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ what_is_about: '', is_relevant: '', where_can_use: '' })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Paper Reflection</h2>
                  <p className="text-sm text-slate-400">Help us understand your reading</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Paper Title */}
            {paper && (
              <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                <p className="text-sm text-slate-400 mb-1">Paper</p>
                <p className="text-white font-medium">{paper.title}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question 1 */}
              <div>
                <label className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">
                      What is this paper about?
                    </p>
                    <p className="text-sm text-slate-400 mb-3">
                      Summarize the main contribution or findings
                    </p>
                    <textarea
                      value={formData.what_is_about}
                      onChange={(e) => setFormData({ ...formData, what_is_about: e.target.value })}
                      placeholder="e.g., This paper introduces a new attention mechanism for transformer models..."
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                      rows={3}
                      required
                    />
                  </div>
                </label>
              </div>

              {/* Question 2 */}
              <div>
                <label className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg mt-1">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">
                      Is it relevant to your work?
                    </p>
                    <p className="text-sm text-slate-400 mb-3">
                      Explain how this relates to your research or interests
                    </p>
                    <textarea
                      value={formData.is_relevant}
                      onChange={(e) => setFormData({ ...formData, is_relevant: e.target.value })}
                      placeholder="e.g., Yes, it's directly related to my work on NLP models..."
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                      rows={3}
                      required
                    />
                  </div>
                </label>
              </div>

              {/* Question 3 */}
              <div>
                <label className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg mt-1">
                    <Target className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">
                      Where can you use this paper in your research?
                    </p>
                    <p className="text-sm text-slate-400 mb-3">
                      Describe potential applications or connections
                    </p>
                    <textarea
                      value={formData.where_can_use}
                      onChange={(e) => setFormData({ ...formData, where_can_use: e.target.value })}
                      placeholder="e.g., I can use this in my current project on improving model efficiency..."
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none resize-none"
                      rows={3}
                      required
                    />
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PaperReflectionModal
