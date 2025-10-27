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

      {/* Requests from learners (frontend mock) */}
      <div className="card" style={{marginTop:16}}>
        <h2 className="title-md" style={{margin:0}}>Mentorship Requests</h2>
        <RequestsTable />
      </div>

      {/* Evidence section */}
      <EvidenceSection />
    </div>
  )
}

function RequestsTable() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sl_requests')) || [] } catch { return [] }
  })

  useEffect(() => {
    const t = setInterval(() => {
      try { setItems(JSON.parse(localStorage.getItem('sl_requests')) || []) } catch {}
    }, 800)
    return () => clearInterval(t)
  }, [])

  const update = (id, status) => {
    const next = items.map(x => x.id === id ? { ...x, status } : x)
    setItems(next)
    localStorage.setItem('sl_requests', JSON.stringify(next))
  }

  if (!items.length) return <div className="muted" style={{marginTop:12}}>No requests yet.</div>

  return (
    <div style={{marginTop:12}}>
      <table className="table">
        <thead>
          <tr>
            <th>Learner</th>
            <th>Topic</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(r => (
            <tr key={r.id}>
              <td>{r.learnerEmail}</td>
              <td>{r.topic}</td>
              <td>{r.status}</td>
              <td>
                {r.status === 'Pending' ? (
                  <>
                    <button className="button button-primary" onClick={()=>update(r.id, 'Accepted')}>Accept</button>{' '}
                    <button className="button" onClick={()=>update(r.id, 'Declined')}>Decline</button>
                  </>
                ) : (
                  <button className="button" onClick={()=>update(r.id, 'Pending')}>Mark Pending</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EvidenceSection() {
  const [uploads, setUploads] = useState(() => { try { return JSON.parse(localStorage.getItem('sl_evidence_uploads')) || [] } catch { return [] } })
  const [links, setLinks] = useState(() => { try { return JSON.parse(localStorage.getItem('sl_evidence_links')) || { github:'', linkedin:'', demo:'', description:'' } } catch { return { github:'', linkedin:'', demo:'', description:'' } } })

  useEffect(() => { localStorage.setItem('sl_evidence_uploads', JSON.stringify(uploads)) }, [uploads])
  useEffect(() => { localStorage.setItem('sl_evidence_links', JSON.stringify(links)) }, [links])

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setUploads(prev => [{ id: Date.now(), name: f.name, url, type: f.type }, ...prev])
  }

  const remove = (id) => setUploads(prev => prev.filter(x => x.id !== id))

  return (
    <div className="card" style={{marginTop:16}}>
      <h2 className="title-md">Evidence</h2>
      <div className="form" style={{marginTop:8}}>
        <label className="button" style={{width:'fit-content', cursor:'pointer'}}>
          Upload PDF/Image
          <input type="file" accept="image/*,application/pdf" onChange={onFile} style={{display:'none'}} />
        </label>
        <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))'}}>
          {uploads.map(u => (
            <div key={u.id} className="card" style={{padding:12}}>
              {u.type?.startsWith('image/') ? (
                <img src={u.url} alt={u.name} style={{maxWidth:'100%', borderRadius:8}} />
              ) : (
                <a href={u.url} download={u.name}>{u.name}</a>
              )}
              <div style={{display:'flex', justifyContent:'flex-end', marginTop:8}}>
                <button className="button" onClick={()=>remove(u.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <input className="input" placeholder="GitHub URL" value={links.github} onChange={e=>setLinks({...links, github:e.target.value})} />
        <input className="input" placeholder="LinkedIn URL" value={links.linkedin} onChange={e=>setLinks({...links, linkedin:e.target.value})} />
        <input className="input" placeholder="Demo link (optional)" value={links.demo} onChange={e=>setLinks({...links, demo:e.target.value})} />
        <textarea className="input" rows={3} placeholder="Short description" value={links.description} onChange={e=>setLinks({...links, description:e.target.value})} />
      </div>
    </div>
  )
}