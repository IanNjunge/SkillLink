 import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { useAuth } from '../state/AuthContext'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'
const TOKEN_KEY = 'sl_token'

export default function MentorDashboard() {
  const { user } = useAuth()
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
      {!user?.verified && <EvidenceSection />}
    </div>
  )
}

function RequestsTable() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setError('Not authenticated'); setLoading(false); return }
    try {
      const res = await fetch(`${BASE_URL}/requests/incoming`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json().catch(()=> [])
      if (!res.ok) throw new Error(data.message || 'Failed to load requests')
      // normalize
      const list = (data || []).map(r => ({
        id: r.id,
        learnerEmail: r.learner_email || r.learnerEmail || r.learner?.email || '—',
        topic: r.topic,
        status: r.status
      }))
      setItems(list)
    } catch (e) {
      setError(e.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const act = async (id, action) => {
    setError('')
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return setError('Not authenticated')
    try {
      const res = await fetch(`${BASE_URL}/requests/${id}/${action}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json().catch(()=> ({}))
      if (!res.ok) throw new Error(data.message || 'Action failed')
      setItems(prev => prev.map(x => x.id === id ? { ...x, status: action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : x.status } : x))
    } catch (e) {
      setError(e.message || 'Action failed')
    }
  }

  if (loading) return <div style={{marginTop:12}}>Loading requests...</div>
  if (error) return <div className="card" style={{marginTop:12, padding:12, background:'#ffe5e5', color:'#a40000'}}>{error}</div>
  if (!items.length) return <div className="muted" style={{marginTop:12}}>No incoming requests.</div>

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
                {r.status?.toLowerCase() === 'pending' ? (
                  <>
                    <button className="button button-primary" onClick={()=>act(r.id, 'accept')}>Accept</button>{' '}
                    <button className="button" onClick={()=>act(r.id, 'decline')}>Decline</button>
                  </>
                ) : (
                  <button className="button" onClick={load}>Refresh</button>
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
  const [items, setItems] = useState([])
  const [desc, setDesc] = useState('')
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [demo, setDemo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submittedMsg, setSubmittedMsg] = useState('')

  // load my evidence
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }
    fetch(`${BASE_URL}/evidence/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => { if (!r.ok) throw new Error(await r.text().catch(()=>'')); return r.json() })
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load evidence'))
      .finally(() => setLoading(false))
  }, [])

  const onFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setError('Not authenticated'); return }
    try {
      const fd = new FormData()
      fd.append('file', f)
      if (desc.trim()) fd.append('description', desc.trim())
      const res = await fetch(`${BASE_URL}/evidence/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      const data = await res.json().catch(()=> ({}))
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      setItems(prev => [data, ...prev])
      setDesc('')
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      e.target.value = ''
    }
  }

  const remove = async (id) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    try {
      const r = await fetch(`${BASE_URL}/evidence/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!r.ok) throw new Error()
      setItems(prev => prev.filter(x => x.id !== id))
    } catch {
      setError('Failed to delete evidence')
    }
  }

  // add link evidence (GitHub/LinkedIn/Demo)
  const addLink = async (kind, url) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return setError('Not authenticated')
    const u = (url || '').trim()
    if (!u) return
    try {
      const res = await fetch(`${BASE_URL}/evidence/link`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ kind, url: u, name: kind.charAt(0).toUpperCase()+kind.slice(1), description: desc.trim() || undefined })
      })
      const data = await res.json().catch(()=> ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to add link')
      setItems(prev => [data, ...prev])
      if (kind==='github') setGithub('')
      if (kind==='linkedin') setLinkedin('')
      if (kind==='demo') setDemo('')
      setDesc('')
    } catch (err) {
      setError(err.message || 'Failed to add link')
    }
  }

  // submit evidence for review (UX confirmation)
  const submitForReview = async () => {
    setSubmittedMsg('')
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return setError('Not authenticated')
    try {
      const r = await fetch(`${BASE_URL}/evidence/submit`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const data = await r.json().catch(()=> ({}))
      if (!r.ok) throw new Error(data.message || 'Submit failed')
      setSubmittedMsg(`Submitted. Pending: ${data.pending}, Total: ${data.total}`)
    } catch (err) {
      setError(err.message || 'Submit failed')
    }
  }

  return (
    <div className="card" style={{marginTop:16}}>
      <h2 className="title-md">Evidence</h2>
      {error && <div className="card" style={{padding:12, background:'#ffe5e5', color:'#a40000'}}>{error}</div>}
      <div className="form" style={{marginTop:8}}>
        <label className="button" style={{width:'fit-content', cursor:'pointer'}}>
          Upload PDF/Image
          <input type="file" accept="image/*,application/pdf" onChange={onFile} style={{display:'none'}} />
        </label>
        <textarea className="input" rows={2} placeholder="Short description (optional)" value={desc} onChange={e=>setDesc(e.target.value)} />

        {/* Links */}
        <input className="input" placeholder="GitHub URL" value={github} onChange={e=>setGithub(e.target.value)} />
        <button className="button" onClick={()=>addLink('github', github)}>Add GitHub Link</button>
        <input className="input" placeholder="LinkedIn URL" value={linkedin} onChange={e=>setLinkedin(e.target.value)} />
        <button className="button" onClick={()=>addLink('linkedin', linkedin)}>Add LinkedIn Link</button>
        <input className="input" placeholder="Demo link (optional)" value={demo} onChange={e=>setDemo(e.target.value)} />
        <button className="button" onClick={()=>addLink('demo', demo)}>Add Demo Link</button>

        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <button className="button button-primary" onClick={submitForReview}>Submit for Review</button>
          {submittedMsg && <span className="muted">{submittedMsg}</span>}
        </div>

        {loading ? <div className="card">Loading...</div> : (
          <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))'}}>
            {items.map(u => (
              <div key={u.id} className="card" style={{padding:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <strong style={{fontSize:14}}>{u.name}</strong>
                  <span className={`badge ${u.status==='approved'?'badge-success':u.status==='rejected'?'badge-danger':'badge-warning'}`}>{u.status||'pending'}</span>
                </div>
                <div className="muted" style={{fontSize:12, marginTop:6}}>{u.description || '—'}</div>
                <div style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
                  <a className="button" href={u.url} target="_blank" rel="noreferrer">View</a>
                  <button className="button" onClick={()=>remove(u.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}