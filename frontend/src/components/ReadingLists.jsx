import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { readingListsAPI } from '../services/api'
import { useUser } from '../context/UserContext'
import { BookOpen, Plus, X, Edit2, Trash2, Lock, Globe, Loader2 } from 'lucide-react'

const ReadingLists = ({ onListSelect, selectedPaperId = null }) => {
  const { currentUser } = useUser()
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingList, setEditingList] = useState(null)

  useEffect(() => {
    if (currentUser) {
      fetchLists()
    }
  }, [currentUser])

  const fetchLists = async () => {
    if (!currentUser) return
    
    try {
      setLoading(true)
      // First, initialize default lists if they don't exist
      await readingListsAPI.initializeDefaults(currentUser.id)
      const response = await readingListsAPI.getUserLists(currentUser.id)
      setLists(response.data)
    } catch (err) {
      console.error('Error fetching reading lists:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim() || !currentUser) return

    try {
      setCreating(true)
      const response = await readingListsAPI.create({
        user_id: currentUser.id,
        name: newListName.trim(),
        description: newListDescription.trim() || null,
        is_public: isPublic,
        is_default: false
      })
      setLists([...lists, response.data])
      setNewListName('')
      setNewListDescription('')
      setShowCreateModal(false)
    } catch (err) {
      console.error('Error creating list:', err)
      alert('Failed to create list. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteList = async (listId, isDefault) => {
    if (isDefault) {
      alert('Cannot delete default lists')
      return
    }

    if (!confirm('Are you sure you want to delete this list?')) return

    try {
      await readingListsAPI.delete(listId)
      setLists(lists.filter(list => list.id !== listId))
    } catch (err) {
      console.error('Error deleting list:', err)
      alert('Failed to delete list. Please try again.')
    }
  }

  const handleAddPaperToList = async (listId, paperId) => {
    try {
      await readingListsAPI.addPaper(listId, paperId)
      // Refresh lists to update paper counts
      fetchLists()
      alert('Paper added to list!')
    } catch (err) {
      console.error('Error adding paper to list:', err)
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('already')) {
        // Paper already in list, that's fine
        return
      }
      alert('Failed to add paper to list. Please try again.')
    }
  }

  if (!currentUser) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <p className="text-slate-400 text-center">Please log in to manage reading lists</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Reading Lists</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New List</span>
        </button>
      </div>

      <div className="space-y-3">
        {lists.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No reading lists yet. Create one to get started!</p>
        ) : (
          lists.map((list) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 hover:border-slate-500 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-semibold">{list.name}</h3>
                    {list.is_default && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                        Default
                      </span>
                    )}
                    {list.is_public ? (
                      <Globe className="w-4 h-4 text-slate-400" title="Public" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" title="Private" />
                    )}
                  </div>
                  {list.description && (
                    <p className="text-slate-400 text-sm mb-2">{list.description}</p>
                  )}
                  <p className="text-slate-500 text-xs">{list.paper_count || 0} papers</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPaperId && (
                    <button
                      onClick={() => handleAddPaperToList(list.id, selectedPaperId)}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30 transition-colors"
                      title="Add paper to this list"
                    >
                      Add
                    </button>
                  )}
                  {onListSelect && (
                    <button
                      onClick={() => onListSelect(list)}
                      className="px-3 py-1.5 bg-slate-600 text-slate-300 text-xs rounded-lg hover:bg-slate-500 transition-colors"
                    >
                      View
                    </button>
                  )}
                  {!list.is_default && (
                    <button
                      onClick={() => handleDeleteList(list.id, list.is_default)}
                      className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create New List</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewListName('')
                  setNewListDescription('')
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Transformer Papers"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Describe what this list is for..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="text-sm text-slate-300">
                  Make this list public
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewListName('')
                    setNewListDescription('')
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateList}
                  disabled={creating || !newListName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ReadingLists
