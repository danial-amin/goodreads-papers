import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ForceGraph2D from 'react-force-graph-2d'
import { Search, ExternalLink, X, Sparkles, Eye } from 'lucide-react'
import { papersAPI } from '../services/api'
import { useUser } from '../context/UserContext'

// Particle system for cosmic background
const CosmicBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const particles = []
    const particleCount = 100

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2
      })
    }

    let animationId
    const animate = () => {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY
        p.pulse += 0.02

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const pulseOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse))

        // Draw glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        gradient.addColorStop(0, `rgba(147, 197, 253, ${pulseOpacity})`)
        gradient.addColorStop(0.5, `rgba(99, 102, 241, ${pulseOpacity * 0.5})`)
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity})`
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    // Initial fill with dark background
    ctx.fillStyle = '#030712'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ background: 'linear-gradient(135deg, #030712 0%, #0c1222 50%, #0f172a 100%)' }}
    />
  )
}

// Floating paper card component
const PaperCard = ({ node, onClose, onOpenPaper, onViewDetails }) => {
  if (!node) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
    >
      <div className="relative bg-gradient-to-br from-slate-900/95 via-indigo-950/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 pointer-events-none" />
        <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 rounded-2xl blur-sm pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative p-6">
          {/* Orb indicator */}
          <div className="absolute -top-3 left-6 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/50 animate-pulse" />

          <h2 className="text-xl font-bold text-white mb-3 pr-12 leading-tight">
            {node.title}
          </h2>

          <p className="text-indigo-200/80 text-sm mb-3">
            {node.authors}
          </p>

          {node.venue && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3 mr-1.5" />
              {node.venue} {node.year && `• ${node.year}`}
            </div>
          )}

          {node.keywords && (
            <div className="flex flex-wrap gap-2 mb-4">
              {node.keywords.split(',').slice(0, 5).map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/20 text-cyan-200"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {node.url && (
              <button
                onClick={onOpenPaper}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-medium hover:from-cyan-400 hover:to-indigo-400 transition-all shadow-lg shadow-indigo-500/30"
              >
                <ExternalLink className="w-4 h-4" />
                Open Paper
              </button>
            )}
            <button
              onClick={onViewDetails}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const PaperMap = () => {
  const { currentUser: user } = useUser()
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [matchingNodes, setMatchingNodes] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const fgRef = useRef()
  const [time, setTime] = useState(0)

  // Animation timer for pulsing effects
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.05)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchGraphData()
  }, [user])

  // Real-time filtering as you type
  useEffect(() => {
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase()
      const matches = new Set()
      graphData.nodes.forEach(node => {
        const nodeText = `${node.title} ${node.authors} ${node.keywords || ''}`.toLowerCase()
        if (nodeText.includes(queryLower)) {
          matches.add(node.id)
        }
      })
      setMatchingNodes(matches)
    } else {
      setMatchingNodes(new Set())
    }
  }, [searchQuery, graphData])

  const fetchGraphData = async (search = '') => {
    try {
      setLoading(true)
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

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node)
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 800)
      fgRef.current.zoom(2.5, 800)
    }
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null)
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 50)
    }
  }, [])

  // Determine node state for rendering
  const getNodeState = useCallback((node) => {
    const isSelected = selectedNode?.id === node.id
    const isHovered = hoveredNode?.id === node.id
    const isSearching = searchQuery.trim().length > 0
    const isMatch = matchingNodes.has(node.id)

    if (isSelected) return 'selected'
    if (isHovered) return 'hovered'
    if (isSearching) {
      return isMatch ? 'match' : 'dimmed'
    }
    return 'normal'
  }, [selectedNode, hoveredNode, searchQuery, matchingNodes])

  // Custom node painting with orb-like glowing effect
  const nodePaint = useCallback((node, ctx, globalScale) => {
    const state = getNodeState(node)
    const baseSize = 6

    // Colors and sizes based on state
    let coreColor, glowColor, opacity, size

    switch (state) {
      case 'selected':
        coreColor = '#22d3ee' // cyan
        glowColor = 'rgba(34, 211, 238, 0.8)'
        opacity = 1
        size = baseSize * 2.5
        break
      case 'hovered':
        coreColor = '#a78bfa' // purple
        glowColor = 'rgba(167, 139, 250, 0.6)'
        opacity = 1
        size = baseSize * 2
        break
      case 'match':
        coreColor = '#10b981' // emerald
        glowColor = 'rgba(16, 185, 129, 0.6)'
        opacity = 1
        size = baseSize * 1.8
        break
      case 'dimmed':
        coreColor = '#374151' // gray
        glowColor = 'rgba(55, 65, 81, 0.3)'
        opacity = 0.25
        size = baseSize * 0.8
        break
      default: // normal
        coreColor = '#6366f1' // indigo
        glowColor = 'rgba(99, 102, 241, 0.5)'
        opacity = 0.9
        size = baseSize * 1.2
    }

    // Pulsing effect for active nodes
    const pulse = state !== 'dimmed' ? 1 + 0.15 * Math.sin(time + node.id * 0.5) : 1
    const finalSize = size * pulse

    ctx.save()
    ctx.globalAlpha = opacity

    // Outer glow (largest, most diffuse)
    if (state !== 'dimmed') {
      const gradient3 = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, finalSize * 4)
      gradient3.addColorStop(0, glowColor)
      gradient3.addColorStop(0.5, glowColor.replace(/[\d.]+\)$/, '0.2)'))
      gradient3.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(node.x, node.y, finalSize * 4, 0, 2 * Math.PI)
      ctx.fillStyle = gradient3
      ctx.fill()
    }

    // Middle glow
    if (state !== 'dimmed') {
      const gradient2 = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, finalSize * 2)
      gradient2.addColorStop(0, glowColor)
      gradient2.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(node.x, node.y, finalSize * 2, 0, 2 * Math.PI)
      ctx.fillStyle = gradient2
      ctx.fill()
    }

    // Core orb with gradient
    const coreGradient = ctx.createRadialGradient(
      node.x - finalSize * 0.3,
      node.y - finalSize * 0.3,
      0,
      node.x,
      node.y,
      finalSize
    )
    coreGradient.addColorStop(0, '#ffffff')
    coreGradient.addColorStop(0.3, coreColor)
    coreGradient.addColorStop(1, coreColor.replace(/^#/, 'rgba(').replace(/(.{2})(.{2})(.{2})/, (_, r, g, b) =>
      `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, 0.8)`
    ))

    ctx.beginPath()
    ctx.arc(node.x, node.y, finalSize, 0, 2 * Math.PI)
    ctx.fillStyle = coreGradient
    ctx.fill()

    // Inner highlight for 3D effect
    if (state !== 'dimmed') {
      ctx.beginPath()
      ctx.arc(node.x - finalSize * 0.25, node.y - finalSize * 0.25, finalSize * 0.3, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.fill()
    }

    ctx.restore()

    // Label for zoomed view or important nodes
    if ((globalScale > 0.8 && state !== 'dimmed') || state === 'selected' || state === 'hovered') {
      ctx.save()
      ctx.globalAlpha = state === 'dimmed' ? 0.3 : opacity
      const fontSize = Math.max(10 / globalScale, 8)
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      // Text shadow for readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillText(node.label, node.x + 1, node.y + finalSize + 8 / globalScale + 1)

      ctx.fillStyle = state === 'dimmed' ? '#6b7280' : '#e2e8f0'
      ctx.fillText(node.label, node.x, node.y + finalSize + 8 / globalScale)
      ctx.restore()
    }
  }, [getNodeState, time])

  // Link styling
  const getLinkColor = useCallback((link) => {
    const sourceState = getNodeState(link.source)
    const targetState = getNodeState(link.target)

    // Dim links connected to dimmed nodes
    if (sourceState === 'dimmed' || targetState === 'dimmed') {
      return 'rgba(55, 65, 81, 0.1)'
    }

    // Highlight links for selected/hovered nodes
    if (sourceState === 'selected' || targetState === 'selected') {
      return 'rgba(34, 211, 238, 0.6)'
    }
    if (sourceState === 'hovered' || targetState === 'hovered') {
      return 'rgba(167, 139, 250, 0.5)'
    }

    // Color by type
    if (link.type === 'topic_progression') {
      if (link.progression_type === 'application') return 'rgba(99, 102, 241, 0.4)'
      if (link.progression_type === 'related_work') return 'rgba(16, 185, 129, 0.4)'
      if (link.progression_type === 'context') return 'rgba(139, 92, 246, 0.4)'
      if (link.progression_type === 'alternative_approach') return 'rgba(245, 158, 11, 0.3)'
      return 'rgba(99, 102, 241, 0.3)'
    }

    return 'rgba(99, 102, 241, 0.2)'
  }, [getNodeState])

  const getLinkWidth = useCallback((link) => {
    const sourceState = getNodeState(link.source)
    const targetState = getNodeState(link.target)

    if (sourceState === 'dimmed' || targetState === 'dimmed') return 0.5
    if (sourceState === 'selected' || targetState === 'selected') return 3
    if (sourceState === 'hovered' || targetState === 'hovered') return 2

    return link.value || 1
  }, [getNodeState])

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950">
      {/* Cosmic particle background */}
      <CosmicBackground />

      {/* Ambient gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header - floating glass style */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Research Universe
                </h1>
                <p className="text-indigo-200/60 text-sm mt-0.5">
                  {graphData.nodes.length} papers • {searchQuery ? `${matchingNodes.size} matches` : 'Explore connections'}
                </p>
              </div>

              {/* Search stats indicator */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 text-sm font-medium">
                    {matchingNodes.size} visible
                  </span>
                </motion.div>
              )}
            </div>

            {/* Search input */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300/50 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Start typing to filter papers..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-indigo-300/40 focus:border-cyan-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-300/50 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>

            {/* Minimal legend */}
            <div className="flex items-center gap-4 mt-3 text-xs text-indigo-200/50">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                <span>Paper</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                <span>Match</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                <span>Selected</span>
              </div>
              <span className="text-indigo-300/30">|</span>
              <span>Click to select • Type to filter</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main graph */}
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-cyan-400/50 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 animate-pulse" />
            </div>
            <p className="text-indigo-200/60">Loading research universe...</p>
          </div>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          backgroundColor="transparent"
          nodeCanvasObject={nodePaint}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.beginPath()
            ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
          }}
          linkColor={getLinkColor}
          linkWidth={getLinkWidth}
          linkDirectionalArrowLength={0}
          linkCurvature={0.15}
          onNodeClick={handleNodeClick}
          onNodeHover={setHoveredNode}
          onBackgroundClick={handleBackgroundClick}
          cooldownTicks={200}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={100}
          onEngineStop={() => {
            if (fgRef.current && graphData.nodes.length > 0) {
              fgRef.current.zoomToFit(500, 80)
            }
          }}
        />
      )}

      {/* Selected paper card */}
      <AnimatePresence>
        {selectedNode && (
          <PaperCard
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onOpenPaper={() => {
              if (selectedNode.url) {
                window.open(selectedNode.url, '_blank', 'noopener,noreferrer')
              } else if (selectedNode.doi) {
                window.open(`https://doi.org/${selectedNode.doi}`, '_blank', 'noopener,noreferrer')
              }
            }}
            onViewDetails={() => {
              window.location.href = `/papers/${selectedNode.id}`
            }}
          />
        )}
      </AnimatePresence>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredNode && !selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
            style={{ transform: 'translate(-50%, -120%)' }}
          >
            <div className="bg-slate-900/90 backdrop-blur-md rounded-lg border border-indigo-500/30 px-4 py-2 shadow-xl max-w-xs">
              <p className="text-white font-medium text-sm truncate">{hoveredNode.title}</p>
              <p className="text-indigo-200/60 text-xs truncate">{hoveredNode.authors?.substring(0, 50)}...</p>
              <p className="text-cyan-400/80 text-xs mt-1">Click to view details</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      {!selectedNode && !loading && graphData.nodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-indigo-200/40 text-sm pointer-events-none"
        >
          <span className="px-4 py-2 rounded-full bg-slate-900/40 backdrop-blur-sm border border-white/5">
            Scroll to zoom • Drag to pan • Click orbs to explore
          </span>
        </motion.div>
      )}
    </div>
  )
}

export default PaperMap
