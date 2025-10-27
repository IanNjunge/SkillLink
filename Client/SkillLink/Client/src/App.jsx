import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SearchMentors from './pages/SearchMentors'
import Dashboard from './pages/Dashboard'
import MentorDashboard from './pages/MentorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import MentorProfile from './pages/MentorProfile'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="app">
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mentors" element={<SearchMentors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mentor" element={<MentorDashboard />} />
          <Route path="/mentor/:id" element={<MentorProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
