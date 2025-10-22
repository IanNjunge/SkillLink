 import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">SkillLink</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/mentors" className="nav-link">Mentors</Link>
          {user && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
          {user && <Link to="/profile" className="nav-link">Profile</Link>}
          {!user ? (
            <>
              <Link to="/login" className="button button-primary">Login</Link>
              <Link to="/register" className="button">Register</Link>
            </>
          ) : (
            <button onClick={logout} className="button">Logout</button>
          )}
        </div>
      </div>
    </nav>
  )
}
