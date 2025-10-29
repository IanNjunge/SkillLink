import { useState } from 'react'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const submit = (e) => {
    e.preventDefault()
    // TODO: call backend to register
    alert('Registered (stub)')
  }

  return (
    <div className="card" style={{maxWidth: 480, margin: '0 auto'}}>
      <h1 className="title-md">Register</h1>
      <form onSubmit={submit} className="form">
        <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input className="input" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <button className="button button-primary button-block">Create account</button>
      </form>
    </div>
  )
}