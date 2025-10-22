import { useMemo, useState } from 'react'

export default function AdminDashboard() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([
    { id: 1, name: 'Robinson Kimani', skill: 'React', status: 'Pending' },
    { id: 2, name: 'Ian Njunge', skill: 'Data Science', status: 'Active' },
    { id: 3, name: 'Odindo Naliyo', skill: 'Flask', status: 'Pending' },
  ])

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
      <div className="card" style={{marginTop: 12}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <input className="input" placeholder="Search mentors, skills, status" value={query} onChange={e=>setQuery(e.target.value)} />
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
            <div key={i} style={{background:'#2563eb', height:h, borderRadius:6}} />
          ))}
        </div>
      </div>
    </div>
  )
}
