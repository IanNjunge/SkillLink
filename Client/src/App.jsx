import { Routes, Route } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './state/AuthContext'
import NavBar from './components/NavBar'
import ErrorBoundary from './components/ErrorBoundary'
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
    <ErrorBoundary>
      <AuthProvider>
        <div className="app">
          <NavBar />
          <div className="container">
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mentors" element={<SearchMentors />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/mentor" element={
              <ProtectedRoute>
                <MentorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/mentor/:id" element={
              <ProtectedRoute>
                <MentorProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
