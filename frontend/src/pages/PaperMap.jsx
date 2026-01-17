import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ForceGraph2D from 'react-force-graph-2d'
import { Search, Download, RefreshCw, ExternalLink } from 'lucide-react'
import { papersAPI } from '../services/api'
import { useUser } from '../context/UserContext'

const PaperMap = () => {
  const { currentUser: user } = useUser()
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedNodes, setHighlightedNodes] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState(null)
  const [viewMode, setViewMode] = useState('graph') // 'graph' or 'grid'
  const fgRef = useRef()

  useEffect(() => {
    fetchGraphData()
  }, [user])

  useEffect(() => {
    // Highlight nodes based on search
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase()
      const highlighted = new Set()
      graphData.nodes.forEach(node => {
        const nodeText = `${node.title} ${node.authors} ${node.keywords || ''}`.toLowerCase()
        if (nodeText.includes(queryLower)) {
          highlighted.add(node.id)
        }
      })
      setHighlightedNodes(highlighted)
    } else {
      setHighlightedNodes(new Set())
    }
  }, [searchQuery, graphData])

  const fetchGraphData = async (search = '') => {
    try {
      setLoading(true)
      // Always search arXiv when there's a search query
      const searchArxiv = search.length > 0
      const response = await papersAPI.getGraph(search, user?.id, searchArxiv)
      setGraphData(response.data)
    } catch (err) {
      console.error('Error fetching graph data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchGraphData(searchQuery)
  }

  const handleNodeClick = (node) => {
    setSelectedNode(node)
    // Center on node
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000)
      fgRef.current.zoom(2, 1000)
    }
  }

  const handleNodeDoubleClick = (node) => {
    // Open paper URL directly
    if (node.url) {
      window.open(node.url, '_blank', 'noopener,noreferrer')
    } else if (node.doi) {
      window.open(`https://doi.org/${node.doi}`, '_blank', 'noopener,noreferrer')
    }
  }

  const handleBackgroundClick = () => {
    setSelectedNode(null)
    if (fgRef.current) {
      fgRef.current.zoomToFit(400)
    }
  }

  const nodePaint = (node, ctx, globalScale) => {
    const isHighlighted = highlightedNodes.has(node.id) || selectedNode?.id === node.id
    const isSearched = searchQuery && highlightedNodes.has(node.id)
    
    // Node color based on state
    let color = '#3b82f6' // blue
    if (isSearched) {
      color = '#ef4444' // red for search matches
    } else if (selectedNode?.id === node.id) {
      color = '#10b981' // green for selected
    } else if (isHighlighted) {
      color = '#f59e0b' // amber for highlighted
    }

    // Draw node
    const size = isHighlighted ? 12 : 8
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
    ctx.fill()

    // Add glow effect for highlighted nodes
    if (isHighlighted) {
      ctx.shadowBlur = 15
      ctx.shadowColor = color
    }

    // Draw label
    if (globalScale > 0.5) {
      ctx.fillStyle = '#1f2937'
      ctx.font = `${12 / globalScale}px Sans-Serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x, node.y + size + 15 / globalScale)
    }
  }

  // Filter nodes for grid view
  const filteredNodes = graphData.nodes.filter(node => {
    if (!searchQuery) return true
    const queryLower = searchQuery.toLowerCase()
    const nodeText = `${node.title} ${node.authors} ${node.keywords || ''}`.toLowerCase()
    return nodeText.includes(queryLower)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Full-width header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Paper Map</h1>
                <p className="text-gray-600 mt-1">
                  {user 
                    ? "Your personalized research network"
                    : "Explore general research trends and connections"
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('graph')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'graph'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Graph View
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Grid View
                </button>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-wrap gap-4">
              <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={viewMode === 'grid' ? "Search papers semantically (searches local DB + arXiv)..." : "Search papers semantically (searches local DB + arXiv)..."}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </form>
              <button
                onClick={() => fetchGraphData(searchQuery)}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh</span>
              </button>
              {viewMode === 'graph' && (
                <button
                  onClick={() => {
                    if (fgRef.current) {
                      fgRef.current.zoomToFit(400)
                    }
                  }}
                  className="btn-secondary"
                >
                  Reset View
                </button>
              )}
            </div>

            {/* Legend */}
            {viewMode === 'graph' && (
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span>Regular Paper</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Search Match</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Selected</span>
                </div>
                <div className="ml-4 pl-4 border-l border-gray-300">
                  <span className="font-semibold">Topic Progression:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-0.5 bg-blue-500"></div>
                  <span>General → Specific</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-0.5 bg-green-500"></div>
                  <span>Related Work</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-0.5 bg-purple-500"></div>
                  <span>Context</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-0.5 bg-amber-500"></div>
                  <span>Alternative</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Full-width content area */}
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === 'graph' ? (
          <div className="w-full h-[calc(100vh-200px)] relative">
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeLabel={(node) => `
                <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 350px; border: 2px solid #3b82f6;">
                  <strong style="color: #1f2937; font-size: 14px;">${node.title}</strong><br/>
                  <small style="color: #6b7280;">${node.authors?.substring(0, 60)}...</small><br/>
                  ${node.venue ? `<small style="color: #3b82f6; font-weight: 600;">${node.venue} ${node.year || ''}</small>` : ''}
                  ${node.keywords ? `<br/><small style="color: #10b981;">Tags: ${node.keywords.substring(0, 40)}...</small>` : ''}
                  ${node.url ? `<br/><small style="color: #ef4444; cursor: pointer;">Click to open paper →</small>` : ''}
                </div>
              `}
              nodeRelSize={8}
              nodeVal={(node) => {
                const isHighlighted = highlightedNodes.has(node.id) || selectedNode?.id === node.id
                return isHighlighted ? 15 : 10
              }}
              linkColor={(link) => {
                if (link.type === 'topic_progression') {
                  if (link.progression_type === 'application') return 'rgba(59, 130, 246, 0.7)'
                  if (link.progression_type === 'related_work') return 'rgba(16, 185, 129, 0.6)'
                  if (link.progression_type === 'context') return 'rgba(139, 92, 246, 0.6)'
                  if (link.progression_type === 'alternative_approach') return 'rgba(245, 158, 11, 0.5)'
                  return 'rgba(107, 114, 128, 0.4)'
                }
                if (link.type === 'domain') return 'rgba(16, 185, 129, 0.4)'
                if (link.type === 'venue') return 'rgba(168, 85, 247, 0.3)'
                return 'rgba(0, 0, 0, 0.2)'
              }}
              linkWidth={(link) => link.value || 1}
              linkDirectionalArrowLength={6}
              linkDirectionalArrowRelPos={1}
              linkCurvature={0.2}
              onNodeClick={handleNodeClick}
              onNodeRightClick={handleNodeDoubleClick}
              onBackgroundClick={handleBackgroundClick}
              nodeCanvasObject={nodePaint}
              cooldownTicks={150}
              d3AlphaDecay={0.022}
              d3VelocityDecay={0.4}
              onEngineStop={() => {
                if (fgRef.current && graphData.nodes.length > 0) {
                  fgRef.current.zoomToFit(400, 20)
                }
              }}
            />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredNodes.map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-4 cursor-pointer border-2 border-transparent hover:border-blue-500"
                  onClick={() => {
                    if (node.url) {
                      window.open(node.url, '_blank', 'noopener,noreferrer')
                    } else {
                      setSelectedNode(node)
                    }
                  }}
                >
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{node.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{node.authors}</p>
                  {node.venue && (
                    <p className="text-xs text-blue-600 font-semibold mb-2">
                      {node.venue} {node.year && `(${node.year})`}
                    </p>
                  )}
                  {node.keywords && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {node.keywords.split(',').slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {node.url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(node.url, '_blank', 'noopener,noreferrer')
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Paper
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
            {filteredNodes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No papers found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNode(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedNode.title}</h2>
            <p className="text-gray-600 mb-2">
              <strong>Authors:</strong> {selectedNode.authors}
            </p>
            {selectedNode.venue && (
              <p className="text-gray-600 mb-2">
                <strong>Venue:</strong> {selectedNode.venue} {selectedNode.year && `(${selectedNode.year})`}
              </p>
            )}
            {selectedNode.keywords && (
              <div className="flex flex-wrap gap-2 mt-4 mb-4">
                {selectedNode.keywords.split(',').map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              {selectedNode.url && (
                <button
                  onClick={() => {
                    window.open(selectedNode.url, '_blank', 'noopener,noreferrer')
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Paper
                </button>
              )}
              <button
                onClick={() => window.location.href = `/papers/${selectedNode.id}`}
                className="btn-secondary"
              >
                View Full Details
              </button>
              <button
                onClick={() => setSelectedNode(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default PaperMap
