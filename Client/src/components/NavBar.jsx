<<<<<<< HEAD
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setLoading(false)
      setMenuOpen(false)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">SkillLink</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/mentors" className="nav-link">Mentors</Link>
          {user && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
          
          {!user ? (
            <>
              <Link to="/login" className="button button-primary">Login</Link>
              <Link to="/register" className="button">Register</Link>
            </>
          ) : (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="button"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  minWidth: 120,
                  justifyContent: 'space-between'
                }}
              >
                <span>{user.name}</span>
                <span style={{ fontSize: '0.8em' }}>▼</span>
              </button>
              
              {menuOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    background: 'white',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    minWidth: 200,
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--gray-200)' }}>
                    <div style={{ fontWeight: 500 }}>{user.name}</div>
                    <div style={{ fontSize: '0.875em', color: 'var(--gray-600)' }}>{user.email}</div>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="nav-link" 
                    style={{ 
                      display: 'block', 
                      padding: '8px 16px',
                      borderBottom: '1px solid var(--gray-200)'
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile & Settings
                  </Link>
                  
                  {user.is_mentor && (
                    <Link 
                      to="/admin" 
                      className="nav-link" 
                      style={{ 
                        display: 'block', 
                        padding: '8px 16px',
                        borderBottom: '1px solid var(--gray-200)'
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="nav-link"
                    style={{ 
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      color: 'var(--red)',
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Logging out...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
=======
 import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { useEffect, useState } from 'react'

export default function NavBar() {
  const { user, logout } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const KEY_PREFIX = 'sl_chat_'
    const calc = () => {
      let total = 0
      for (let i=0; i<localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(KEY_PREFIX)) {
          try {
            const msgs = JSON.parse(localStorage.getItem(k) || '[]')
            total += msgs.filter(m => m.from !== 'me' && !m.readAt).length
          } catch {}
        }
      }
      setUnread(total)
    }
    calc()
    const timer = setInterval(calc, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">SkillLink</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/mentors" className="nav-link">Search Mentors</Link>
          {user && (
            <Link to="/conversations" className="nav-link" style={{position:'relative'}}>
              Inbox{unread>0 && <span className="badge" style={{position:'absolute', top:-6, right:-10, padding:'2px 6px'}}>{unread}</span>}
            </Link>
          )}
          {user && <Link to={user.role === 'mentor' ? "/mentor" : "/dashboard"} className="nav-link">Dashboard</Link>}
          {user && <Link to="/links" className="nav-link">Links</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
          {/* Profile link hidden to match UI preview */}
          {!user ? (
            <>
              <Link to="/login" className="button button-primary">Login</Link>
              <Link to="/register" className="button">Register</Link>
            </>
          ) : (
            <>
              <span className="nav-link" style={{display:'inline-flex', alignItems:'center', gap:6}}>
                <span role="img" aria-label="user">👤</span>
                {(user.name || user.email || 'Username') + (user.role ? ` (${user.role})` : '')}
              </span>
              <button onClick={logout} className="button">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
>>>>>>> main
