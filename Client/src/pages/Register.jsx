<<<<<<< HEAD
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
=======
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { Api } from '../state/api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const navigate = useNavigate()
  const { login } = useAuth()
  const [role, setRole] = useState('learner')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) return setError('Please fill all fields')
    try {
      const user = await Api.register({ name: form.name, email: form.email, password: form.password, role })
      login(user)
      navigate(role === 'mentor' ? '/mentor' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="container" style={{paddingTop: 24}}>
      <div style={{maxWidth: 640, margin:'0 auto'}}>
        <div style={{marginBottom: 12, display:'flex', alignItems:'center', gap:8}}>
          <div className="badge">SkillLink</div>
          <div style={{fontWeight:700}}>Register</div>
        </div>
        <h1 className="title-lg" style={{textAlign:'center', margin:'16px 0 24px'}}>Create Your Account</h1>
        {error && <div className="card" style={{padding:12, background:'#ffe5e5', color:'#a40000'}}>{error}</div>}
        <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:18}}>
          <div style={{display:'flex', gap:12}}>
            <button type="button" onClick={()=>setRole('learner')} className="button button-block" style={{background: role==='learner' ? 'var(--primary)' : '#eef1f5', color: role==='learner' ? '#fff' : '#222', border:'none', padding:'12px', borderRadius:'var(--radius)', fontWeight:600}}>Learner</button>
            <button type="button" onClick={()=>setRole('mentor')} className="button button-block" style={{background: role==='mentor' ? 'var(--primary)' : '#eef1f5', color: role==='mentor' ? '#fff' : '#222', border:'none', padding:'12px', borderRadius:'var(--radius)', fontWeight:600}}>Mentor</button>
          </div>
          <input
            placeholder="Name"
            value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}
            style={{background:'#eef1f5', border:'none', padding:'16px 18px', borderRadius:'var(--radius)', outline:'none', fontSize:16}}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={e=>setForm({...form,email:e.target.value})}
            style={{background:'#eef1f5', border:'none', padding:'16px 18px', borderRadius:'var(--radius)', outline:'none', fontSize:16}}
          />
          <input
            placeholder="Password (min 8 chars)"
            type="password"
            value={form.password}
            onChange={e=>setForm({...form,password:e.target.value})}
            style={{background:'#eef1f5', border:'none', padding:'16px 18px', borderRadius:'var(--radius)', outline:'none', fontSize:16}}
          />
          <button className="button button-block" style={{background:'var(--primary)', color:'#fff', padding:'16px', borderRadius:'var(--radius)', fontWeight:700}}>Create Account</button>
        </form>
        <div style={{marginTop:16, fontSize:14, textAlign:'center'}}>
          <span className="muted">Already have an account?</span> <a href="/login" className="nav-link" style={{padding:0, border:'none'}}>Sign In</a>
        </div>
      </div>
    </div>
  )
}
>>>>>>> main
