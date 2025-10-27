import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { useNavigate, useLocation, Link } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      // Redirect to the page they tried to visit or dashboard
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{maxWidth: 480, margin: '24px auto'}}>
      <div className="badge" style={{marginBottom: 12}}>Login</div>
      <h1 className="title-lg">Sign in to SkillLink</h1>
      <form onSubmit={submit} className="form" style={{marginTop: 16}}>
        {error && (
          <div style={{ color: 'var(--red)', marginBottom: 12 }}>{error}</div>
        )}
        <input 
          className="input" 
          placeholder="Email" 
          type="email"
          value={email} 
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input 
          className="input" 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <div style={{display:'flex', justifyContent:'flex-end'}}>
          <Link to="/forgot-password" className="nav-link" style={{padding:0, border:'none'}}>
            Forgot password?
          </Link>
        </div>
        <button 
          className="button button-primary button-block"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div style={{marginTop:12, fontSize:14}}>
        <span className="muted">Don't have an account?</span>{' '}
        <Link to="/register" className="nav-link" style={{padding:0, border:'none'}}>
          Create an Account
        </Link>
      </div>
    </div>
  )
}
