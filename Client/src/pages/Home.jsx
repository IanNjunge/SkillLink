import { Link } from 'react-router-dom'

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
            <Link to="/mentors" className="button" style={{
              background:'#e9eef3', color:'#222', padding:'16px 28px', borderRadius:16, minWidth:220, textAlign:'center', fontWeight:600
            }}>Find a mentor</Link>
            <Link to="/dashboard" className="button" style={{
              background:'#e9eef3', color:'#222', padding:'16px 28px', borderRadius:16, minWidth:220, textAlign:'center', fontWeight:600
            }}>Go to Dashboard</Link>
          </div>
        </div>
      </div>
      <div style={{maxWidth: 1080, margin:'56px auto 0', padding:'0 16px'}}>
        <h2 className="title-lg" style={{textAlign:'center'}}>Why Choose SkillLink?</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:20, marginTop:28}}>
          <div style={{background:'#ffffff', borderRadius:16, padding:22, boxShadow:'0 4px 16px rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" stroke="#2563eb" strokeWidth="1.8"/><path d="M15 3v4a1 1 0 0 0 1 1h4" stroke="#2563eb" strokeWidth="1.8"/></svg>
              <div style={{fontWeight:700}}>Learn Skills</div>
            </div>
            <div style={{opacity:0.9}}>Connect with experienced mentors in various fields</div>
          </div>
          <div style={{background:'#ffffff', borderRadius:16, padding:22, boxShadow:'0 4px 16px rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" stroke="#2563eb" strokeWidth="1.8"/><path d="M3 21a7 7 0 0 1 18 0" stroke="#2563eb" strokeWidth="1.8"/></svg>
              <div style={{fontWeight:700}}>Peer Network</div>
            </div>
            <div style={{opacity:0.9}}>Build relationships with like‑minded learners</div>
          </div>
          <div style={{background:'#ffffff', borderRadius:16, padding:22, boxShadow:'0 4px 16px rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 7h7l-5.5 4.1L18 21l-6-3.8L6 21l1.5-7.9L2 9h7l3-7Z" stroke="#2563eb" strokeWidth="1.8"/></svg>
              <div style={{fontWeight:700}}>Verified Mentors</div>
            </div>
            <div style={{opacity:0.9}}>All mentors are verified with credentials</div>
          </div>
          <div style={{background:'#ffffff', borderRadius:16, padding:22, boxShadow:'0 4px 16px rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19h16M4 15l4-4 3 3 7-7" stroke="#2563eb" strokeWidth="1.8"/></svg>
              <div style={{fontWeight:700}}>Track Progress</div>
            </div>
            <div style={{opacity:0.9}}>Monitor your learning journey and achievements</div>
          </div>
        </div>
      </div>
      <div style={{background:'#f3f7ff', marginTop:36, padding:'32px 0'}}>
        <div style={{maxWidth:1080, margin:'0 auto', padding:'0 16px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:16, alignItems:'end', textAlign:'center'}}>
          <div>
            <div style={{color:'#2563eb', fontSize:26, fontWeight:800}}>500+</div>
            <div style={{opacity:0.8}}>Active Mentors</div>
          </div>
          <div>
            <div style={{color:'#2563eb', fontSize:26, fontWeight:800}}>1000+</div>
            <div style={{opacity:0.8}}>Learners</div>
          </div>
          <div>
            <div style={{color:'#2563eb', fontSize:26, fontWeight:800}}>50+</div>
            <div style={{opacity:0.8}}>Skills Available</div>
          </div>
          <div>
            <div style={{color:'#2563eb', fontSize:26, fontWeight:800}}>4.8/5</div>
            <div style={{opacity:0.8}}>Average Rating</div>
          </div>
        </div>
      </div>
      <div style={{background:'#eaf2ff', marginTop:36, padding:'44px 16px', borderRadius: 12}}>
        <div style={{maxWidth: 960, margin:'0 auto', textAlign:'center'}}>
          <h3 className="title-lg" style={{marginBottom:8}}>Ready to Start Your Journey?</h3>
          <p style={{opacity:0.9, marginBottom:22}}>Join thousands of learners and mentors already growing their skills</p>
          <Link to="/register" className="button" style={{background:'#2563eb', color:'#fff', padding:'14px 24px', borderRadius:14, fontWeight:700}}>Create Free Account</Link>
        </div>
      </div>
    </div>
  )
}
