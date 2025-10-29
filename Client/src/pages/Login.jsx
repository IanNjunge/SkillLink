import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { useNavigate, useLocation, Link } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('learner')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    setError('')
    setLoading(true)
    try {
      const me = await login(email, password)
      const r = me?.role || role
      const from = location.state?.from?.pathname || (r === 'admin' ? '/admin' : r === 'mentor' ? '/mentor' : '/dashboard')
      navigate(from, { replace: true })
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 12, display:'flex', alignItems:'center', gap:8 }}>
          <div className="badge">SkillLink</div>
          <div style={{ fontWeight:700 }}>Login</div>
        </div>

        <h1 className="title-lg" style={{ textAlign:'center', margin:'16px 0 24px' }}>
          Sign in to SkillLink
        </h1>

        {error && (
          <div className="card" style={{ padding:12, background:'#ffe5e5', color:'#a40000' }}>
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
          {['learner','mentor','admin'].map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className="button button-block"
              style={{
                background: role===r ? 'var(--primary)' : '#eef1f5',
                color: role===r ? '#fff' : '#222',
                border:'none', padding:'12px', borderRadius:'var(--radius)', fontWeight:600
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            disabled={loading}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
            disabled={loading}
          />
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <Link to="/forgot-password" className="nav-link" style={{ padding:0, border:'none' }}>
              Forgot Password?
            </Link>
          </div>
          <button
            className="button button-primary button-block"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop:16, fontSize:14, textAlign:'center' }}>
          <span className="muted">Don't have an account?</span>{' '}
          <Link to="/register" className="nav-link" style={{ padding:0, border:'none' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  )
}
