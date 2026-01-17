import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Send, Sparkles, Loader2 } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { chatAPI } from '../services/api'

const ChatRecommendations = () => {
  const { currentUser } = useUser()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      type: 'bot',
      content: "Hi! I'm your research paper assistant. Ask me for recommendations like 'I'm interested in transformer models' or 'Show me papers about computer vision'."
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || !currentUser || loading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setMessages(prev => [...prev, { type: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await chatAPI.getRecommendations({
        user_id: currentUser.id,
        message: userMessage,
        limit: 5
      })
      
      setMessages(prev => [...prev, { type: 'bot', content: response.data.response }])
      setRecommendations(response.data.recommendations || [])
    } catch (err) {
      console.error('Error getting recommendations:', err)
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "Sorry, I encountered an error. Please try again."
      }])
    } finally {
      setLoading(false)
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
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Chat for Recommendations</h1>
          </div>
          <p className="text-gray-600">
            Have a conversation to get personalized paper recommendations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="card p-6 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask for recommendations..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                  disabled={loading || !currentUser}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim() || !currentUser}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Recommendations Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Recommended Papers</h2>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {recommendations.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Start a conversation to get recommendations
                  </p>
                ) : (
                  recommendations.map((rec, idx) => (
                    <motion.div
                      key={rec.paper.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <a
                        href={`/papers/${rec.paper.id}`}
                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                          {rec.paper.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {rec.paper.authors?.substring(0, 50)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-600 font-medium">
                            Score: {(rec.score * 100).toFixed(0)}%
                          </span>
                          {rec.paper.year && (
                            <span className="text-xs text-gray-500">{rec.paper.year}</span>
                          )}
                        </div>
                      </a>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatRecommendations
