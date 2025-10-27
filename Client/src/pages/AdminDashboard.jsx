import { useMemo, useState } from 'react'

export default function AdminDashboard() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([
    { id: 1, name: 'Robinson Kimani', skill: 'React', status: 'Pending' },
    { id: 2, name: 'Ian Njunge', skill: 'Data Science', status: 'Active' },
    { id: 3, name: 'Odindo Naliyo', skill: 'Flask', status: 'Pending' },
  ])

  const stats = useMemo(() => {
    const total = rows.length
    const pending = rows.filter(r => r.status === 'Pending').length
    const active = rows.filter(r => r.status === 'Active').length
    return { total, pending, active }
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.skill.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    )
  }, [rows, query])

  const verify = (id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'Active' } : r))
  }

  const togglePending = (id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Active' ? 'Pending' : 'Active' } : r))
  }

  return (
    <div className="container" style={{paddingTop: 24}}>
      <div className="badge" style={{marginBottom: 8}}>Admin Dashboard</div>
      <h1 className="title-lg">Mentor Verification</h1>

      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', margin:'12px 0'}}>
        <div className="card"><div className="muted" style={{fontSize:12}}>Pending</div><div style={{fontSize:28, fontWeight:700}}>{stats.pending}</div></div>
        <div className="card"><div className="muted" style={{fontSize:12}}>Active</div><div style={{fontSize:28, fontWeight:700}}>{stats.active}</div></div>
        <div className="card"><div className="muted" style={{fontSize:12}}>Total</div><div style={{fontSize:28, fontWeight:700}}>{stats.total}</div></div>
      </div>

      <div className="card" style={{marginTop: 12}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="Search mentors, skills, status"
            style={{background:'#eef1f5', border:'none', padding:'14px 16px', borderRadius:'var(--radius)', outline:'none', fontSize:16, width:'100%'}}
          />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Mentor</th>
              <th>Skill</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.skill}</td>
                <td>{m.status}</td>
                <td>
                  <a className="button" href={`/mentor/${m.id}`} style={{marginRight:8}}>View</a>
                  {m.status === 'Pending' ? (
                    <button className="button button-primary" onClick={() => verify(m.id)}>Verify</button>
                  ) : (
                    <button className="button" onClick={() => togglePending(m.id)}>Set Pending</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="title-md" style={{marginTop: 24}}>Reports</h2>
      <div className="card">
        <div style={{display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:12, alignItems:'end', height:160}}>
          {[40, 60, 80, 120, 100, 50].map((h,i) => (
            <div key={i} style={{background:'var(--primary)', height:h, borderRadius:6}} />
          ))}
        </div>
      </div>
    </div>
  )
}
