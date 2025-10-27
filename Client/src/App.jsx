import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SearchMentors from './pages/SearchMentors'
import Dashboard from './pages/Dashboard'
import MentorDashboard from './pages/MentorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import MentorProfile from './pages/MentorProfile'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import Chat from './pages/Chat'
import Conversations from './pages/Conversations'
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['learner']}><Dashboard /></ProtectedRoute>} />
          <Route path="/mentor" element={<ProtectedRoute roles={['mentor']}><MentorDashboard /></ProtectedRoute>} />
          <Route path="/mentor/:id" element={<MentorProfile />} />
          <Route path="/chat/:mentorId" element={<ProtectedRoute roles={['learner','mentor']}><Chat /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/conversations" element={<ProtectedRoute roles={['learner','mentor']}><Conversations /></ProtectedRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
