import { useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMsg('')
    if (!email || !token || !password) { setError('Fill all fields'); return }
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/auth/reset`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), token: token.trim(), password })
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data.message || 'Reset failed')
      setMsg('Password reset successful. You can login now.')
    } catch (err) {
      setError(err.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{paddingTop: 24}}>
      <div style={{maxWidth: 640, margin:'0 auto'}}>
        <div style={{marginBottom: 12, display:'flex', alignItems:'center', gap:8}}>
          <div className="badge">SkillLink</div>
          <div style={{fontWeight:700}}>Password Reset</div>
        </div>
        <h1 className="title-lg" style={{textAlign:'center', margin:'16px 0 24px'}}>Reset Password</h1>
        {msg && <div className="card" style={{padding:12, background:'#e9f9ee', color:'#0a6b2d'}}>{msg}</div>}
        {error && <div className="card" style={{padding:12, background:'#ffe5e5', color:'#a40000'}}>{error}</div>}
        <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:16}}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="input" />
          <input placeholder="Reset Token" value={token} onChange={e=>setToken(e.target.value)} className="input" />
          <input placeholder="New Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" />
          <button className="button button-primary" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  )
}
