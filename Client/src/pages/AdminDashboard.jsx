import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'
const TOKEN_KEY = 'sl_token'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [evLoading, setEvLoading] = useState(true)
  const [evError, setEvError] = useState('')
  const [mentorEvidence, setMentorEvidence] = useState({})
  const [openEvidenceFor, setOpenEvidenceFor] = useState(null)
  const [evRowLoading, setEvRowLoading] = useState(false)

  
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setError('Not authenticated'); setLoading(false); return }
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${BASE_URL}/admin/mentors?status=pending`, { headers }).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`${BASE_URL}/admin/mentors?status=verified`, { headers }).then(r => r.ok ? r.json() : Promise.reject())
    ])
      .then(([pending, verified]) => {
        const pendList = (pending || []).map(m => ({ ...m, status: 'Pending', skills: m.skills || [] }))
        const verList = (verified || []).map(m => ({ ...m, status: 'Active', skills: m.skills || [] }))
        const all = [...pendList, ...verList]
        setMentors(all)
        setStats({ total: all.length, active: verList.length, pending: pendList.length })
      })
      .catch(() => setError('Failed to load mentors'))
      .finally(() => setLoading(false))

    // load pending evidence
    setEvLoading(true)
    fetch(`${BASE_URL}/admin/evidence?status=pending`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setEvidence(Array.isArray(data) ? data : []))
      .catch(() => setEvError('Failed to load evidence'))
      .finally(() => setEvLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return mentors.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.skills.some(s => s.toLowerCase().includes(q)) ||
      (m.status || '').toLowerCase().includes(q)
    )
  }, [mentors, query])

  const verify = async (id) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      const res = await fetch(`${BASE_URL}/admin/mentors/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ verified: true })
      })
      if (!res.ok) throw new Error()
      setMentors(prev => prev.map(m => m.id === id ? { ...m, status: 'Active' } : m))
      setStats(s => s ? { ...s, active: s.active + 1, pending: Math.max(0, s.pending - 1) } : s)
    } catch {
      setError('Failed to update status')
    }

  }

  const reviewEvidence = async (id, status) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      const res = await fetch(`${BASE_URL}/admin/evidence/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error()
      setEvidence(prev => prev.filter(e => e.id !== id))
      setMentorEvidence(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(k => {
          next[k] = (next[k] || []).filter(e => e.id !== id)
        })
        return next
      })
    } catch {
      setEvError('Failed to update evidence')
    }
  }

  const loadMentorEvidence = async (mentorId) => {
    try {
      setEvRowLoading(true)
      const token = localStorage.getItem(TOKEN_KEY)
      const res = await fetch(`${BASE_URL}/admin/evidence?mentor_id=${mentorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMentorEvidence(prev => ({ ...prev, [mentorId]: Array.isArray(data) ? data : [] }))
      setOpenEvidenceFor(mentorId)
    } catch {
      setMentorEvidence(prev => ({ ...prev, [mentorId]: [] }))
      setOpenEvidenceFor(mentorId)
    } finally {
      setEvRowLoading(false)
    }
  }

  const togglePending = async (id) => {
    const newStatus = mentors.find(m => m.id === id)?.status === 'Active' ? 'Pending' : 'Active'
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      const res = await fetch(`${BASE_URL}/admin/mentors/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ verified: newStatus === 'Active' })
      })
      if (!res.ok) throw new Error()
      setMentors(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
      setStats(s => s ? {
        ...s,
        active: newStatus === 'Active' ? s.active + 1 : Math.max(0, s.active - 1),
        pending: newStatus === 'Active' ? Math.max(0, s.pending - 1) : s.pending + 1
      } : s)
    } catch {
      setError('Failed to update status')
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{padding: 24}}>
        <div className="card">
          <h2 className="title-md" style={{color: 'var(--red)'}}>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{paddingTop: 24}}>
      <div className="badge" style={{marginBottom: 8}}>Admin Dashboard</div>
      <h1 className="title-lg">Mentor Verification</h1>

      {/* Stats */}
      {stats && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12, marginBottom:24}}>
          <div className="card" style={{padding:16}}>
            <div className="title-sm">Total Mentors</div>
            <div className="title-lg">{stats.total}</div>
          </div>
          <div className="card" style={{padding:16}}>
            <div className="title-sm">Active</div>
            <div className="title-lg" style={{color:'var(--green)'}}>{stats.active}</div>
          </div>
          <div className="card" style={{padding:16}}>
            <div className="title-sm">Pending</div>
            <div className="title-lg" style={{color:'var(--yellow)'}}>{stats.pending}</div>
          </div>
        </div>
      )}

      {/* Search & Table */}
      <div className="card">
        <input 
          className="input" 
          placeholder="Search mentors, skills, status" 
          value={query} 
          onChange={e => setQuery(e.target.value)}
          style={{maxWidth:300, marginBottom:12}}
        />
        {error && <div style={{color:'var(--red)', marginBottom:12}}>{error}</div>}
        {loading ? <div>Loading mentors...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Mentor</th>
                <th>Skills</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <>
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.skills?.join(', ') || 'No skills'}</td>
                    <td>
                      <span className={`badge ${m.status==='Active'?'badge-success':'badge-warning'}`}>
                        {m.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <Link className="button" to={`/mentor/${m.id}`} style={{marginRight:8}}>View</Link>
                      <button className="button" style={{marginRight:8}}
                        onClick={()=> loadMentorEvidence(m.id)}>
                        Evidence
                      </button>
                      {m.status==='Pending' ? (
                        <button className="button button-primary" onClick={()=>verify(m.id)}>Verify</button>
                      ) : (
                        <button className="button" onClick={()=>togglePending(m.id)}>Set Pending</button>
                      )}
                    </td>
                  </tr>
                  {openEvidenceFor === m.id && (
                    <tr>
                      <td colSpan={4}>
                        {evRowLoading ? (
                          <div>Loading evidence...</div>
                        ) : (
                          (mentorEvidence[m.id] && mentorEvidence[m.id].length) ? (
                            <div style={{display:'grid', gap:8}}>
                              {mentorEvidence[m.id].map(e => (
                                <div key={e.id} className="card" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:12}}>
                                  <div style={{display:'flex', gap:12, alignItems:'center'}}>
                                    <span className="badge">#{e.id}</span>
                                    <span style={{fontWeight:600}}>{e.name}</span>
                                    <span className="muted">{e.type}</span>
                                    <span className="muted" style={{maxWidth:360, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.description || '—'}</span>
                                  </div>
                                  <div>
                                    <a className="button" href={e.url} target="_blank" rel="noreferrer" style={{marginRight:8}}>View</a>
                                    <button className="button button-primary" onClick={()=>reviewEvidence(e.id,'approved')} style={{marginRight:8}}>Approve</button>
                                    <button className="button" onClick={()=>reviewEvidence(e.id,'rejected')}>Reject</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="muted">No evidence submitted</div>
                          )
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Activity */}
      <h2 className="title-md" style={{marginTop:24}}>Recent Activity</h2>
      <div className="card">
        {stats && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:12, alignItems:'end', height:160}}>
            {Array.from({length:7}).map((_,i) => {
              const height = Math.max(40, Math.min(160, stats.total * (Math.random()*0.8 + 0.2)))
              return <div key={i} style={{background:'var(--primary)', height, borderRadius:6, transition:'height 0.3s'}} />
            })}
          </div>
        )}
      </div>

      {/* Evidence Review */}
      <h2 className="title-md" style={{marginTop:24}}>Evidence Review</h2>
      <div className="card">
        {evError && <div style={{color:'var(--red)', marginBottom:12}}>{evError}</div>}
        {evLoading ? <div>Loading evidence...</div> : (
          evidence.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mentor</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map(e => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.mentor_id}</td>
                    <td>{e.name}</td>
                    <td>{e.type}</td>
                    <td className="muted" style={{maxWidth:280, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.description || '—'}</td>
                    <td>
                      <a className="button" href={e.url} target="_blank" rel="noreferrer" style={{marginRight:8}}>View</a>
                      <button className="button button-primary" onClick={()=>reviewEvidence(e.id,'approved')} style={{marginRight:8}}>Approve</button>
                      <button className="button" onClick={()=>reviewEvidence(e.id,'rejected')}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="muted">No pending evidence</div>
        )}
      </div>
    </div>
  )
}
