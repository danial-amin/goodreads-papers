import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Papers from './pages/Papers'
import Recommendations from './pages/Recommendations'
import PaperDetail from './pages/PaperDetail'
import PaperMap from './pages/PaperMap'
import ChatRecommendations from './pages/ChatRecommendations'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import { UserProvider } from './context/UserContext'

// Layout component to conditionally show Navbar
const Layout = ({ children }) => {
  const location = useLocation()
  const hideNavbarRoutes = ['/onboarding']
  const showNavbar = !hideNavbarRoutes.includes(location.pathname)

  return (
    <div className="min-h-screen">
      {showNavbar && <Navbar />}
      {children}
    </div>
  )
}

function App() {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/papers/:id" element={<PaperDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/map" element={<PaperMap />} />
            <Route path="/chat" element={<ChatRecommendations />} />
          </Routes>
        </Layout>
      </Router>
    </UserProvider>
  )
}

export default App
