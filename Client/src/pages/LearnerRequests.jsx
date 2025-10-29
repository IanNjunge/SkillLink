import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../state/AuthContext'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
const TOKEN_KEY = 'sl_token'

export default function LearnerRequests() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }
    fetch(`${BASE_URL}/requests/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) throw new Error(await r.text().catch(()=> 'Failed'))
        return r.json()
      })
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load requests'))
      .finally(() => setLoading(false))
  }, [])

  // API already returns only this learner's requests
  const mine = items

  const cancel = async (id) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    try {
      const r = await fetch(`${BASE_URL}/requests/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!r.ok) throw new Error()
      setItems(prev => prev.map(x => x.id === id ? { ...x, status: 'cancelled' } : x))
    } catch {
      setError('Failed to cancel request')
    }
  }

  return (
    <div className="container" style={{paddingTop:16}}>
      <h1 className="title-lg">My Mentorship Requests</h1>
      {error && <div className="card" style={{padding:12, background:'#ffe5e5', color:'#a40000'}}>{error}</div>}
      {loading && <div className="card">Loading...</div>}
      {(!loading && mine.length === 0) && <div className="card">No requests yet.</div>}
      {mine.length > 0 && (
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
                  <td>{r.mentorName || r.mentor_id}</td>
                  <td>{r.topic}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.status === 'pending' || r.status === 'Pending' ? (
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
