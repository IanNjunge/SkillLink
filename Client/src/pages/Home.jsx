 export default function Home() {
  return (
    <div className="container" style={{paddingTop: 0}}>
      <div style={{
        background:'#3ba3ff',
        color:'#fff',
        padding:'48px 24px',
        borderRadius: 8,
        marginTop: 12
      }}>
        <div style={{maxWidth: 960, margin:'0 auto'}}>
          <h1 className="title-xl" style={{color:'#fff'}}>Connect. Learn. Grow</h1>
          <p style={{opacity:0.95, marginTop:8}}>SkillLink connects learners with verified mentors for affordable, accessible peer learning and mentorship.</p>
          <div style={{display:'flex', gap:24, flexWrap:'wrap', marginTop:32}}>
            <a href="/mentors" className="button" style={{
              background:'#e9eef3', color:'#222', padding:'16px 28px', borderRadius:16, minWidth:220, textAlign:'center', fontWeight:600
            }}>Find a mentor</a>
            <a href="/dashboard" className="button" style={{
              background:'#e9eef3', color:'#222', padding:'16px 28px', borderRadius:16, minWidth:220, textAlign:'center', fontWeight:600
            }}>Go to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  )
}