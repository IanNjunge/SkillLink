import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../state/AuthContext'

export default function LearnerRequests() {
  const { user } = useAuth()
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sl_requests')) || [] } catch { return [] }
  })

  useEffect(() => {
    const t = setInterval(() => {
      try { setItems(JSON.parse(localStorage.getItem('sl_requests')) || [] ) } catch {}
    }, 800)
    return () => clearInterval(t)
  }, [])

  const mine = useMemo(() => {
    if (!user) return []
    return items.filter(r => r.learnerEmail === user.email)
  }, [items, user])

  const cancel = (id) => {
    const next = items.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r)
    setItems(next)
    localStorage.setItem('sl_requests', JSON.stringify(next))
  }

  return (
    <div className="container" style={{paddingTop:16}}>
      <h1 className="title-lg">My Mentorship Requests</h1>
      {(!user || mine.length === 0) && <div className="card">No requests yet.</div>}
      {user && mine.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Mentor</th>
                <th>Topic</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mine.map(r => (
                <tr key={r.id}>
                  <td>{r.mentorName}</td>
                  <td>{r.topic}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.status === 'Pending' ? (
                      <button className="button" onClick={()=>cancel(r.id)}>Cancel</button>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
