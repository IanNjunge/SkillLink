import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    is_mentor: false 
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.name, form.is_mentor)
      navigate('/dashboard')
    } catch (err) {
      setError('Registration failed. Email may be taken.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{maxWidth: 480, margin: '24px auto'}}>
      <div className="badge" style={{marginBottom: 12}}>Register</div>
      <h1 className="title-lg">Create your account</h1>
      <form onSubmit={submit} className="form" style={{marginTop: 16}}>
        {error && (
          <div style={{ color: 'var(--red)', marginBottom: 12 }}>{error}</div>
        )}
        <input 
          className="input" 
          placeholder="Name" 
          value={form.name} 
          onChange={e => setForm({...form, name: e.target.value})}
          required
          disabled={loading}
        />
        <input 
          className="input" 
          type="email"
          placeholder="Email" 
          value={form.email} 
          onChange={e => setForm({...form, email: e.target.value})}
          required
          disabled={loading}
        />
        <input 
          className="input" 
          type="password"
          placeholder="Password" 
          value={form.password} 
          onChange={e => setForm({...form, password: e.target.value})}
          required
          disabled={loading}
          minLength={6}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <input
            type="checkbox"
            checked={form.is_mentor}
            onChange={e => setForm({...form, is_mentor: e.target.checked})}
            disabled={loading}
          />
          I want to be a mentor
        </label>
        <button 
          className="button button-primary button-block"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <div style={{marginTop:12, fontSize:14}}>
        <span className="muted">Already have an account?</span>{' '}
        <Link to="/login" className="nav-link" style={{padding:0, border:'none'}}>
          Sign in
        </Link>
      </div>
    </div>
  )
}
