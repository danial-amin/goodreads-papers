import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user and token from localStorage
    const savedUser = localStorage.getItem('paperreads_user')
    const savedToken = localStorage.getItem('auth_token')
    
    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser))
        setAuthToken(savedToken)
        
        // Verify token is still valid
        verifyToken(savedToken)
      } catch (err) {
        console.error('Error loading user:', err)
        // Clear invalid data
        localStorage.removeItem('paperreads_user')
        localStorage.removeItem('auth_token')
      }
    }
    setLoading(false)
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        // Token invalid, clear it
        logout()
      } else {
        const user = await response.json()
        setCurrentUser(user)
        localStorage.setItem('paperreads_user', JSON.stringify(user))
      }
    } catch (err) {
      console.error('Token verification failed:', err)
      logout()
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setAuthToken(null)
    localStorage.removeItem('paperreads_user')
    localStorage.removeItem('auth_token')
  }

  const updateUser = (user) => {
    setCurrentUser(user)
    localStorage.setItem('paperreads_user', JSON.stringify(user))
  }

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      setCurrentUser: updateUser, 
      authToken,
      setAuthToken,
      logout,
      loading
    }}>
      {children}
    </UserContext.Provider>
  )
}
