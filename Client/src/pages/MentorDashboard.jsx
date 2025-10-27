 import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function MentorDashboard() {
  const [skills, setSkills] = useState(() => {
    try {
      const saved = localStorage.getItem('sl_mentor_skills')
      return saved ? JSON.parse(saved) : ['Python', 'Project Management']
    } catch {
      return ['Python', 'Project Management']
    }
  })
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    localStorage.setItem('sl_mentor_skills', JSON.stringify(skills))
  }, [skills])

  const addSkill = () => {
    const s = newSkill.trim()
    if (!s) return
    if (skills.some(k => k.toLowerCase() === s.toLowerCase())) return alert('Skill already added')
    setSkills(prev => [...prev, s])
    setNewSkill('')
  }

  const removeSkill = (s) => {
    setSkills(prev => prev.filter(x => x !== s))
  }

  return (
    <div className="container" style={{paddingTop: 24}}>
      <div className="badge" style={{marginBottom: 8}}>Mentor Dashboard</div>
      <div className="cols-2">
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <h2 className="title-md" style={{margin:0}}>Skills</h2>
            <button className="button button-primary" onClick={addSkill}>Add Skill</button>
          </div>
          <div className="form" style={{marginBottom:12}}>
            <input
              className="input"
              placeholder="Add a skill..."
              value={newSkill}
              onChange={e=>setNewSkill(e.target.value)}
              onKeyDown={e=>{ if (e.key==='Enter') { e.preventDefault(); addSkill() } }}
            />
          </div>
          <div className="form">
            {skills.map((s,i) => (
              <div key={i} className="card" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:12}}>
                <span>{s}</span>
                <div style={{display:'flex', gap:8}}>
                  <button className="button" onClick={()=>removeSkill(s)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2 className="title-md" style={{margin:0}}>Sessions</h2>
            <span className="muted">January</span>
          </div>
          <div style={{marginTop:12}}>
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  )
}