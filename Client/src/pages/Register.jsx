import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [role, setRole] = useState('learner')
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
      await register(form.email, form.password, form.name, role === 'mentor')
      navigate(role === 'mentor' ? '/mentor' : '/dashboard')
    } catch (err) {
      setError('Registration failed. Email may be taken.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div className="badge">SkillLink</div>
          <div style={{ fontWeight: 700 }}>Register</div>
        </div>
        <h1 className="title-lg" style={{ textAlign: 'center', margin: '16px 0 24px' }}>
          Create Your Account
        </h1>

        {error && (
          <div className="card" style={{ padding: 12, background: '#ffe5e5', color: '#a40000' }}>
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => setRole('learner')}
            className="button button-block"
            style={{
              background: role === 'learner' ? 'var(--primary)' : '#eef1f5',
              color: role === 'learner' ? '#fff' : '#222',
              border: 'none',
              padding: '12px',
              borderRadius: 'var(--radius)',
              fontWeight: 600
            }}
          >
            Learner
          </button>
          <button
            type="button"
            onClick={() => setRole('mentor')}
            className="button button-block"
            style={{
              background: role === 'mentor' ? 'var(--primary)' : '#eef1f5',
              color: role === 'mentor' ? '#fff' : '#222',
              border: 'none',
              padding: '12px',
              borderRadius: 'var(--radius)',
              fontWeight: 600
            }}
          >
            Mentor
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="input"
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="input"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="input"
            disabled={loading}
            minLength={6}
          />
          <button className="button button-primary button-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 14, textAlign: 'center' }}>
          <span className="muted">Already have an account?</span>{' '}
          <Link to="/login" className="nav-link" style={{ padding: 0, border: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
