import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)

  // Calculate unread messages
  useEffect(() => {
    const KEY_PREFIX = 'sl_chat_'
    const calcUnread = () => {
      let total = 0
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith(KEY_PREFIX)) {
          try {
            const msgs = JSON.parse(localStorage.getItem(k) || '[]')
            total += msgs.filter(m => m.from !== 'me' && !m.readAt).length
          } catch {}
        }
      }
      setUnread(total)
    }
    calcUnread()
    const timer = setInterval(calcUnread, 1000)
    return () => clearInterval(timer)
  }, [])

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
          
          {user && (
            <Link to="/conversations" className="nav-link" style={{ position:'relative' }}>
              Inbox
              {unread > 0 && (
                <span className="badge" style={{ position:'absolute', top:-6, right:-10, padding:'2px 6px' }}>
                  {unread}
                </span>
              )}
            </Link>
          )}

          {user && (
            <Link to={user.role === 'mentor' ? '/mentor' : '/dashboard'} className="nav-link">
              Dashboard
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}

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
                style={{ display: 'flex', alignItems:'center', gap:8, minWidth:120, justifyContent:'space-between' }}
              >
                <span>{user.name || user.email}</span>
                <span style={{ fontSize: '0.8em' }}>▼</span>
              </button>

              {menuOpen && (
                <div style={{
                  position:'absolute', top:'100%', right:0, marginTop:4,
                  background:'white', border:'1px solid var(--gray-200)', borderRadius:8,
                  boxShadow:'0 2px 8px rgba(0,0,0,0.1)', minWidth:200, zIndex:100
                }}>
                  <div style={{ padding:'8px 16px', borderBottom:'1px solid var(--gray-200)' }}>
                    <div style={{ fontWeight:500 }}>{user.name}</div>
                    <div style={{ fontSize:'0.875em', color:'var(--gray-600)' }}>{user.email}</div>
                  </div>

                  <Link to="/profile" className="nav-link" style={{ display:'block', padding:'8px 16px', borderBottom:'1px solid var(--gray-200)' }} onClick={()=>setMenuOpen(false)}>
                    Profile & Settings
                  </Link>

                  {user.role === 'admin' && (
                    <Link to="/admin" className="nav-link" style={{ display:'block', padding:'8px 16px', borderBottom:'1px solid var(--gray-200)' }} onClick={()=>setMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="nav-link"
                    style={{ width:'100%', textAlign:'left', padding:'8px 16px', color:'var(--red)', cursor:'pointer' }}
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
