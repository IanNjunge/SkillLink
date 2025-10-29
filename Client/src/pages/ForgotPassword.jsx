export default function ForgotPassword() {
  const submit = (e) => {
    e.preventDefault()
    alert('Password reset link sent (mock)')
  }
  return (
    <div className="container" style={{paddingTop: 24}}>
      <div style={{maxWidth: 640, margin:'0 auto'}}>
        <div style={{marginBottom: 12, display:'flex', alignItems:'center', gap:8}}>
          <div className="badge">SkillLink</div>
          <div style={{fontWeight:700}}>Password Reset</div>
        </div>
        <h1 className="title-lg" style={{textAlign:'center', margin:'16px 0 24px'}}>Forgot Password</h1>
        <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:18}}>
          <input placeholder="Email" style={{background:'#eef1f5', border:'none', padding:'16px 18px', borderRadius:'var(--radius)', outline:'none', fontSize:16}} />
          <button className="button button-block" style={{background:'var(--primary)', color:'#fff', padding:'16px', borderRadius:'var(--radius)', fontWeight:700}}>Send Reset Link</button>
        </form>
      </div>
    </div>
  )
}
