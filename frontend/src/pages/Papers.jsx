import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PaperCard from '../components/PaperCard'
import { papersAPI } from '../services/api'
import { Search, Loader2, Download, Upload, X } from 'lucide-react'

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
      const params = search ? { search } : {}
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
      // Refresh papers list
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Papers</h1>
          <p className="text-gray-600 mb-6">
            Discover research papers from various fields
          </p>

          {/* Search Bar and Fetch Button */}
          <div className="flex flex-wrap gap-4 mb-8">
            <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers by title, authors, or keywords..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-2 px-6"
                >
                  Search
                </button>
              </div>
            </form>
            <button
              onClick={handleFetchExternal}
              disabled={fetching}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{fetching ? 'Fetching...' : 'Fetch New Papers'}</span>
            </button>
            <label className="btn-secondary flex items-center space-x-2 cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>Upload BibTeX</span>
              <input
                type="file"
                accept=".bib,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowBibTeXUpload(!showBibTeXUpload)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Paste BibTeX</span>
            </button>
          </div>

          {/* BibTeX Upload Modal */}
          {showBibTeXUpload && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Upload BibTeX</h3>
                <button
                  onClick={() => {
                    setShowBibTeXUpload(false)
                    setBibtexContent('')
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={bibtexContent}
                onChange={(e) => setBibtexContent(e.target.value)}
                placeholder="Paste your BibTeX content here...&#10;&#10;Example:&#10;@article{example,&#10;  title={Example Paper},&#10;  author={John Doe},&#10;  journal={Example Journal},&#10;  year={2024}&#10;}"
                className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setShowBibTeXUpload(false)
                    setBibtexContent('')
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBibTeXUpload}
                  disabled={uploading || !bibtexContent.trim()}
                  className="btn-primary disabled:opacity-50"
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
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Papers Grid */}
        {!loading && !error && (
          <>
            {papers.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">
                  {searchQuery ? 'No papers found matching your search.' : 'No papers available yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {papers.map((paper, index) => (
                  <PaperCard key={paper.id} paper={paper} delay={index * 0.1} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Papers
