import { useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    setToken('')
    if (!email) { setError('Enter your email'); return }
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data.message || 'Request failed')
      setMsg('Password reset link sent')
      if (data.reset_token) setToken(data.reset_token)
    } catch (err) {
      setError(err.message || 'Request failed')
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
        <h1 className="title-lg" style={{textAlign:'center', margin:'16px 0 24px'}}>Forgot Password</h1>
        {msg && <div className="card" style={{padding:12, background:'#e9f9ee', color:'#0a6b2d'}}>{msg}</div>}
        {error && <div className="card" style={{padding:12, background:'#ffe5e5', color:'#a40000'}}>{error}</div>}
        {token && (
          <div className="card" style={{padding:12, background:'#f4f7ff', color:'#1e3a8a'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap'}}>
              <div>
                Reset Token: <code>{token}</code>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button type="button" className="button" onClick={()=>navigator.clipboard?.writeText(token)}>
                  Copy Token
                </button>
                <a className="button button-primary" href={`/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`}>
                  Open Reset Page
                </a>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:18}}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{background:'#eef1f5', border:'none', padding:'16px 18px', borderRadius:'var(--radius)', outline:'none', fontSize:16}} />
          <button className="button button-block" disabled={loading} style={{background:'var(--primary)', color:'#fff', padding:'16px', borderRadius:'var(--radius)', fontWeight:700}}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
      </div>
    </div>
  )
}
