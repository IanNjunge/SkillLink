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