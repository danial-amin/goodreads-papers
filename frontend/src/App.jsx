import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import { UserProvider } from './context/UserContext'

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/papers/:id" element={<PaperDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/map" element={<PaperMap />} />
            <Route path="/chat" element={<ChatRecommendations />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  )
}

export default App
