import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Briefcase, BookOpen, Target, Compass,
  Zap, Brain, ArrowRight, ArrowLeft, Check, Sparkles,
  TrendingUp, Search, Layers
} from 'lucide-react'
import { useUser } from '../context/UserContext'
import { onboardingAPI } from '../services/api'

const USER_TYPES = [
  {
    value: 'phd_student',
    label: 'PhD Student',
    icon: GraduationCap,
    description: 'Building research foundations and developing expertise'
  },
  {
    value: 'postdoc',
    label: 'Postdoc',
    icon: Briefcase,
    description: 'Deepening expertise and exploring new directions'
  },
  {
    value: 'professor',
    label: 'Professor/PI',
    icon: BookOpen,
    description: 'Staying current and guiding research directions'
  },
  {
    value: 'industry_researcher',
    label: 'Industry Researcher',
    icon: Zap,
    description: 'Applying research to real-world problems'
  },
  {
    value: 'hobbyist',
    label: 'Research Enthusiast',
    icon: Brain,
    description: 'Learning and exploring out of curiosity'
  },
]

const GOALS = [
  {
    value: 'build_reading_habit',
    label: 'Build a Reading Habit',
    icon: Target,
    description: 'Develop consistent weekly paper reading'
  },
  {
    value: 'explore_new_fields',
    label: 'Explore New Fields',
    icon: Compass,
    description: 'Discover research areas outside your comfort zone'
  },
  {
    value: 'stay_current',
    label: 'Stay Current',
    icon: TrendingUp,
    description: 'Keep up with the latest in your field'
  },
  {
    value: 'deep_expertise',
    label: 'Build Deep Expertise',
    icon: Layers,
    description: 'Become an expert in a specific area'
  },
  {
    value: 'research_project',
    label: 'Research Project',
    icon: Search,
    description: 'Find papers for a specific project'
  },
]

const DOMAINS = [
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'Reinforcement Learning', 'Robotics', 'Systems', 'Security',
  'HCI', 'Theory', 'Bioinformatics', 'Data Science',
  'Distributed Systems', 'Databases', 'Networks', 'Graphics'
]

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to research papers' },
  { value: 'intermediate', label: 'Intermediate', description: 'Read papers occasionally' },
  { value: 'expert', label: 'Expert', description: 'Read papers regularly' },
]

const Onboarding = () => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    user_type: '',
    primary_goal: '',
    weekly_paper_goal: 3,
    experience_level: '',
    research_interests: '',
    preferred_domains: []
  })

  const { currentUser, setCurrentUser } = useUser()
  const navigate = useNavigate()
  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleDomainToggle = (domain) => {
    setFormData(prev => ({
      ...prev,
      preferred_domains: prev.preferred_domains.includes(domain)
        ? prev.preferred_domains.filter(d => d !== domain)
        : [...prev.preferred_domains, domain]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await onboardingAPI.complete(formData)
      setCurrentUser(response.data.user)
      navigate('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return formData.user_type !== ''
      case 2: return formData.primary_goal !== ''
      case 3: return formData.experience_level !== ''
      case 4: return true
      default: return false
    }
  }

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Step {step} of {totalSteps}</span>
            <span className="text-sm text-slate-400">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Card */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence mode="wait" custom={step}>
            {/* Step 1: User Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to PaperReads</h2>
                  <p className="text-slate-400">Let's personalize your experience. What best describes you?</p>
                </div>

                <div className="space-y-3">
                  {USER_TYPES.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.user_type === type.value
                    return (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, user_type: type.value })}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${isSelected ? 'bg-blue-500' : 'bg-slate-700'}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {type.label}
                          </p>
                          <p className="text-sm text-slate-500">{type.description}</p>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Primary Goal */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">What's your main goal?</h2>
                  <p className="text-slate-400">This helps us tailor recommendations and features for you</p>
                </div>

                <div className="space-y-3">
                  {GOALS.map((goal) => {
                    const Icon = goal.icon
                    const isSelected = formData.primary_goal === goal.value
                    return (
                      <button
                        key={goal.value}
                        onClick={() => setFormData({ ...formData, primary_goal: goal.value })}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${isSelected ? 'bg-purple-500' : 'bg-slate-700'}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {goal.label}
                          </p>
                          <p className="text-sm text-slate-500">{goal.description}</p>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-purple-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Experience & Weekly Goal */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Set your pace</h2>
                  <p className="text-slate-400">We'll help you build consistent reading habits</p>
                </div>

                <div className="space-y-6">
                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Your experience with research papers
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {EXPERIENCE_LEVELS.map((level) => {
                        const isSelected = formData.experience_level === level.value
                        return (
                          <button
                            key={level.value}
                            onClick={() => setFormData({ ...formData, experience_level: level.value })}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                            }`}
                          >
                            <p className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {level.label}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{level.description}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Weekly Goal */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Weekly reading goal
                    </label>
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-4xl font-bold text-white">{formData.weekly_paper_goal}</span>
                        <span className="text-slate-400">papers per week</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.weekly_paper_goal}
                        onChange={(e) => setFormData({ ...formData, weekly_paper_goal: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Casual</span>
                        <span>Moderate</span>
                        <span>Intense</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Research Interests */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-4">
                    <Compass className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Your research interests</h2>
                  <p className="text-slate-400">Select domains you're interested in (optional)</p>
                </div>

                <div className="space-y-6">
                  {/* Domain chips */}
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS.map((domain) => {
                      const isSelected = formData.preferred_domains.includes(domain)
                      return (
                        <button
                          key={domain}
                          onClick={() => handleDomainToggle(domain)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {domain}
                        </button>
                      )
                    })}
                  </div>

                  {/* Free-form interests */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Other interests (optional)
                    </label>
                    <textarea
                      value={formData.research_interests}
                      onChange={(e) => setFormData({ ...formData, research_interests: e.target.value })}
                      placeholder="e.g., attention mechanisms, graph neural networks, federated learning..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                step === 1
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  canProceed()
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Get Started'}
                <Sparkles className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Skip option */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/papers')}
            className="text-slate-500 hover:text-slate-400 text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
