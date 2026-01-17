import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles, BookOpen, TrendingUp, Search, Target, Compass,
  Layers, Brain, Zap, ArrowRight, ChevronRight, Users, BarChart3
} from 'lucide-react'
import { useUser } from '../context/UserContext'

const Home = () => {
  const { currentUser } = useUser()

  const features = [
    {
      icon: Target,
      title: 'Build Reading Habits',
      description: 'Track your weekly reading goals with streaks and progress visualization',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Compass,
      title: 'Explore or Go Deep',
      description: 'Smart advisor tells you when to explore new fields or deepen your expertise',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Layers,
      title: 'Track Understanding',
      description: 'Six levels from "Skimmed" to "Implemented" - know your true expertise',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'Domain Expertise Map',
      description: 'Visualize your knowledge across research areas with radar charts',
      gradient: 'from-emerald-500 to-teal-500',
    },
  ]

  const stats = [
    { label: 'Research Domains', value: '15+' },
    { label: 'Understanding Levels', value: '6' },
    { label: 'Weekly Goal Tracking', value: 'Yes' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>Your Research Reading Companion</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Build </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Research Expertise
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Not just another reading list. PaperReads helps you build habits, track understanding depth,
              and guides your journey between exploration and deep expertise.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {currentUser ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/papers"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold hover:bg-slate-700 transition-all"
                  >
                    <Search className="w-5 h-5" />
                    Find Papers
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/papers"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold hover:bg-slate-700 transition-all"
                  >
                    <Search className="w-5 h-5" />
                    Explore Papers
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
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
            <h2 className="text-4xl font-bold text-white mb-4">
              Not Your Average Paper Tracker
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built for researchers who want to build lasting expertise, not just check boxes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-slate-600 transition-all h-full">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400">
              Three steps to research mastery
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Tell Us About You',
                description: 'Are you a PhD student building habits? A researcher exploring new fields? We adapt to your goals.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Track Your Reading',
                description: 'Mark papers from "Skimmed" to "Implemented". Build streaks. Hit weekly goals.',
                icon: BarChart3,
              },
              {
                step: '03',
                title: 'Get Smart Guidance',
                description: 'Our advisor tells you when to go deep vs. explore. Build T-shaped expertise.',
                icon: Zap,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                    <item.icon className="w-10 h-10 text-blue-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 text-center border border-blue-500/20"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Build Research Expertise?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join researchers who track not just what they read, but how well they understand it.
            </p>
            {!currentUser && (
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Start Your Journey
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
