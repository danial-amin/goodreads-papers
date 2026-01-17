import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, BookOpen, TrendingUp, Search } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'Get personalized paper recommendations based on your reading history and interests',
    },
    {
      icon: BookOpen,
      title: 'Track Your Reading',
      description: 'Organize papers you want to read, are reading, or have completed',
    },
    {
      icon: TrendingUp,
      title: 'Discover Trends',
      description: 'Find popular and highly-cited papers in your field',
    },
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Search through papers by title, authors, keywords, and abstracts',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Discover Research Papers
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your intelligent companion for finding and organizing research papers.
              Get personalized recommendations tailored to your interests.
            </p>
            <div className="flex justify-center space-x-4 flex-wrap gap-4">
              <Link to="/papers" className="btn-primary">
                Explore Papers
              </Link>
              <Link to="/map" className="btn-secondary">
                View Paper Map
              </Link>
              <Link to="/chat" className="btn-secondary">
                Chat for Recommendations
              </Link>
              <Link to="/recommendations" className="btn-secondary">
                Get Recommendations
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why PaperReads?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to stay on top of research
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="card p-6 text-center h-full">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
