import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const papersAPI = {
  getAll: (params = {}) => api.get('/api/papers', { params }),
  getById: (id) => api.get(`/api/papers/${id}`),
  create: (data) => api.post('/api/papers', data),
  update: (id, data) => api.put(`/api/papers/${id}`, data),
  delete: (id) => api.delete(`/api/papers/${id}`),
  getSimilar: (id, limit = 5) => api.get(`/api/papers/${id}/similar`, { params: { limit } }),
  getGraph: (search = '', userId = null, searchArxiv = false) => api.get('/api/papers/graph', { params: { search, limit: 50, user_id: userId, search_arxiv: searchArxiv } }),
  fetchExternal: (data) => api.post('/api/papers/fetch', data),
  uploadBibTeX: (bibtexContent) => api.post('/api/papers/upload-bibtex', { bibtex_content: bibtexContent }),
}

export const recommendationsAPI = {
  getForUser: (userId, limit = 10) => 
    api.get(`/api/users/${userId}/recommendations`, { params: { limit } }),
}

export const interactionsAPI = {
  create: (data) => api.post('/api/interactions', data),
  getUserInteractions: (userId) => api.get(`/api/users/${userId}/interactions`),
}

export const chatAPI = {
  getRecommendations: (data) => api.post('/api/chat/recommendations', data),
}

export const onboardingAPI = {
  complete: (data) => api.post('/api/onboarding/complete', data),
  getStatus: () => api.get('/api/onboarding/status'),
}

export const habitsAPI = {
  getReadingHabits: (userId) => api.get(`/api/users/${userId}/reading-habits`),
  updateWeeklyGoal: (userId, weeklyGoal) =>
    api.put(`/api/users/${userId}/weekly-goal`, null, { params: { weekly_goal: weeklyGoal } }),
}

export const exploreExploitAPI = {
  getAnalysis: (userId) => api.get(`/api/users/${userId}/explore-exploit`),
  getDomainExpertise: (userId) => api.get(`/api/users/${userId}/domain-expertise`),
}

export const understandingAPI = {
  getLevels: () => api.get('/api/understanding-levels'),
}

export default api
