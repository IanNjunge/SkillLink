import { useState } from 'react'
import { useAuth } from '../state/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e) => {
    e.preventDefault()
    // Replace with real API call to Flask backend
    login({ email })
  }

  return (
    <div className="card" style={{maxWidth: 480, margin: '24px auto'}}>
      <div className="badge" style={{marginBottom: 12}}>Login</div>
      <h1 className="title-lg">Sign in to SkillLink</h1>
      <form onSubmit={submit} className="form" style={{marginTop: 16}}>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{display:'flex', justifyContent:'flex-end'}}>
          <a href="#" className="nav-link" style={{padding:0, border:'none'}}>Forgot password?</a>
        </div>
        <button className="button button-primary button-block">Sign In</button>
      </form>
      <div style={{marginTop:12, fontSize:14}}>
        <span className="muted">Don't have an account?</span> <a href="/register" className="nav-link" style={{padding:0, border:'none'}}>Create an Account</a>
      </div>
    </div>
  )
}