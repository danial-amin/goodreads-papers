import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PaperCard from '../components/PaperCard'
import { papersAPI } from '../services/api'
import { Search, Loader2, Download, Upload, X, BookOpen } from 'lucide-react'

const Papers = () => {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [showBibTeXUpload, setShowBibTeXUpload] = useState(false)
  const [bibtexContent, setBibtexContent] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchPapers()
  }, [])

  const fetchPapers = async (search = '') => {
    try {
      setLoading(true)
      const params = search ? { search, limit: 300 } : { limit: 300 }
      const response = await papersAPI.getAll(params)
      setPapers(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching papers:', err)
      setError('Failed to load papers. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPapers(searchQuery)
  }

  const handleFetchExternal = async () => {
    try {
      setFetching(true)
      const response = await papersAPI.fetchExternal({
        sources: ["arxiv"],
        max_per_source: 20
      })
      await fetchPapers()
      alert(`Fetched ${response.data.length} new papers from arXiv!`)
    } catch (err) {
      console.error('Error fetching external papers:', err)
      alert('Failed to fetch papers. Please try again.')
    } finally {
      setFetching(false)
    }
  }

  const handleBibTeXUpload = async () => {
    if (!bibtexContent.trim()) {
      alert('Please paste BibTeX content')
      return
    }

    try {
      setUploading(true)
      const response = await papersAPI.uploadBibTeX(bibtexContent)
      setBibtexContent('')
      setShowBibTeXUpload(false)
      await fetchPapers()
      alert(`Successfully imported ${response.data.length} papers from BibTeX!`)
    } catch (err) {
      console.error('Error uploading BibTeX:', err)
      alert('Failed to upload BibTeX. Please check the format and try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setBibtexContent(event.target.result)
        setShowBibTeXUpload(true)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Browse Papers</h1>
              <p className="text-slate-400">Discover research papers from various fields</p>
            </div>
          </div>

          {/* Search Bar and Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers by title, authors, or keywords..."
                  className="w-full pl-12 pr-28 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleFetchExternal}
              disabled={fetching}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{fetching ? 'Fetching...' : 'Fetch from arXiv'}</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload BibTeX File</span>
              <input
                type="file"
                accept=".bib,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowBibTeXUpload(!showBibTeXUpload)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Paste BibTeX</span>
            </button>
          </div>

          {/* BibTeX Upload Modal */}
          {showBibTeXUpload && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Upload BibTeX</h3>
                <button
                  onClick={() => {
                    setShowBibTeXUpload(false)
                    setBibtexContent('')
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={bibtexContent}
                onChange={(e) => setBibtexContent(e.target.value)}
                placeholder="Paste your BibTeX content here...&#10;&#10;Example:&#10;@article{example,&#10;  title={Example Paper},&#10;  author={John Doe},&#10;  journal={Example Journal},&#10;  year={2024}&#10;}"
                className="w-full h-64 p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono text-sm resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowBibTeXUpload(false)
                    setBibtexContent('')
                  }}
                  className="px-4 py-2 bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBibTeXUpload}
                  disabled={uploading || !bibtexContent.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-slate-400">Loading papers...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Papers Grid */}
        {!loading && !error && (
          <>
            {papers.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">
                  {searchQuery ? 'No papers found matching your search.' : 'No papers available yet.'}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Try fetching papers from arXiv or uploading a BibTeX file.
                </p>
              </div>
            ) : (
              <>
                <p className="text-slate-400 mb-4">{papers.length} papers found</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {papers.map((paper, index) => (
                    <PaperCard key={paper.id} paper={paper} delay={index * 0.05} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Papers
