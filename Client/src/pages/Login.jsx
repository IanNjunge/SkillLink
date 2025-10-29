import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { Api } from '../state/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('learner')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Enter email and password')
    try {
      const user = await Api.login({ email, password })
      // keep chosen role only for redirect (backend returns stored role)
      login(user)
      const finalRole = user.role || role
      navigate(finalRole === 'admin' ? '/admin' : finalRole === 'mentor' ? '/mentor' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="container" style={{paddingTop: 24}}>
      <div style={{maxWidth: 640, margin: '0 auto'}}>
        <div style={{marginBottom: 12, display:'flex', alignItems:'center', gap:8}}>
          <div className="badge">SkillLink</div>
          <div style={{fontWeight:700}}>Login</div>
        </div>
        <h1 className="title-lg" style={{textAlign:'center', margin:'16px 0 24px'}}>Sign In To SkillLink</h1>
        {error && <div className="card" style={{padding:12, background:'#ffe5e5', color:'#a40000'}}>{error}</div>}
        <form onSubmit={submit} style={{maxWidth: 640, margin:'0 auto', display:'flex', flexDirection:'column', gap:18}}>
          <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            <button type="button" onClick={()=>setRole('learner')} className="button button-block" style={{background: role==='learner' ? 'var(--primary)' : '#eef1f5', color: role==='learner' ? '#fff' : '#222', border:'none', padding:'12px', borderRadius:'var(--radius)', fontWeight:600}}>Learner</button>
            <button type="button" onClick={()=>setRole('mentor')} className="button button-block" style={{background: role==='mentor' ? 'var(--primary)' : '#eef1f5', color: role==='mentor' ? '#fff' : '#222', border:'none', padding:'12px', borderRadius:'var(--radius)', fontWeight:600}}>Mentor</button>
            <button type="button" onClick={()=>setRole('admin')} className="button button-block" style={{background: role==='admin' ? 'var(--primary)' : '#eef1f5', color: role==='admin' ? '#fff' : '#222', border:'none', padding:'12px', borderRadius:'var(--radius)', fontWeight:600}}>Admin</button>
          </div>
          <input
            placeholder="Email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            style={{
              background:'#eef1f5', border:'none', padding:'16px 18px', borderRadius:16, outline:'none', fontSize:16
            }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            style={{
              background:'#eef1f5', border:'none', padding:'16px 18px', borderRadius:16, outline:'none', fontSize:16
            }}
          />
          <div style={{display:'flex', justifyContent:'flex-end'}}>
            <a href="/forgot-password" className="nav-link" style={{padding:0, border:'none'}}>Forgot&nbsp;Password?</a>
          </div>
          <button
            className="button button-block"
            style={{background:'#3ba3ff', color:'#fff', padding:'16px', borderRadius:16, fontWeight:700}}
          >
            Sign In
          </button>
        </form>
        <div style={{marginTop:16, fontSize:14, textAlign:'center'}}>
          <span className="muted">Don't have an account?</span> <a href="/register" className="nav-link" style={{padding:0, border:'none'}}>Create an Account</a>
        </div>
      </div>
    </div>
  )
}