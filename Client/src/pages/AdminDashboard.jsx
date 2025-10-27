import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  // Load mentors on mount
  useEffect(() => {
    fetch('/search/mentors', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setMentors(data.mentors || [])
        // Simple stats
        setStats({
          total: data.mentors.length,
          active: data.mentors.filter(m => m.status === 'Active').length,
          pending: data.mentors.filter(m => m.status === 'Pending').length
        })
      })
      .catch(err => setError('Failed to load mentors'))
      .finally(() => setLoading(false))
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
      const res = await fetch(`/mentorship/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Active' }),
        credentials: 'include'
      })
      if (!res.ok) throw new Error()
      setMentors(prev => 
        prev.map(m => m.id === id ? { ...m, status: 'Active' } : m)
      )
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const togglePending = async (id) => {
    const newStatus = mentors.find(m => m.id === id)?.status === 'Active' 
      ? 'Pending' 
      : 'Active'
    try {
      const res = await fetch(`/mentorship/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      })
      if (!res.ok) throw new Error()
      setMentors(prev => 
        prev.map(m => m.id === id ? { ...m, status: newStatus } : m)
      )
    } catch (err) {
      setError('Failed to update status')
    }
  }

  if (!user?.is_mentor) {
    return (
      <div className="container" style={{padding: 24}}>
        <div className="card">
          <h2 className="title-md" style={{color: 'var(--red)'}}>Access Denied</h2>
          <p>You need mentor privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{paddingTop: 24}}>
      <div className="badge" style={{marginBottom: 8}}>Admin Dashboard</div>
      <h1 className="title-lg">Mentor Verification</h1>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 24
        }}>
          <div className="card" style={{padding: 16}}>
            <div className="title-sm">Total Mentors</div>
            <div className="title-lg">{stats.total}</div>
          </div>
          <div className="card" style={{padding: 16}}>
            <div className="title-sm">Active</div>
            <div className="title-lg" style={{color: 'var(--green)'}}>{stats.active}</div>
          </div>
          <div className="card" style={{padding: 16}}>
            <div className="title-sm">Pending</div>
            <div className="title-lg" style={{color: 'var(--yellow)'}}>{stats.pending}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <input 
            className="input" 
            placeholder="Search mentors, skills, status" 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            style={{maxWidth: 300}}
          />
        </div>

        {error && (
          <div style={{ color: 'var(--red)', marginBottom: 12 }}>{error}</div>
        )}

        {loading ? (
          <div>Loading mentors...</div>
        ) : filtered.length === 0 ? (
          <div>No mentors found</div>
        ) : (
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
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.skills?.join(', ') || 'No skills'}</td>
                  <td>
                    <span className={`badge ${m.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {m.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <Link 
                      className="button" 
                      to={`/mentor/${m.id}`} 
                      style={{marginRight:8}}
                    >
                      View
                    </Link>
                    {m.status === 'Pending' ? (
                      <button 
                        className="button button-primary" 
                        onClick={() => verify(m.id)}
                      >
                        Verify
                      </button>
                    ) : (
                      <button 
                        className="button" 
                        onClick={() => togglePending(m.id)}
                      >
                        Set Pending
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="title-md" style={{marginTop: 24}}>Recent Activity</h2>
      <div className="card">
        {stats && (
          <div style={{
            display:'grid', 
            gridTemplateColumns:'repeat(7, 1fr)', 
            gap:12, 
            alignItems:'end', 
            height:160
          }}>
            {Array.from({length: 7}).map((_, i) => {
              const height = Math.max(40, Math.min(160, stats.total * (Math.random() * 0.8 + 0.2)))
              return (
                <div 
                  key={i} 
                  style={{
                    background: 'var(--primary)',
                    height,
                    borderRadius: 6,
                    transition: 'height 0.3s ease'
                  }} 
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
