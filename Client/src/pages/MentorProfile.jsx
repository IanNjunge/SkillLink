import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
const TOKEN_KEY = 'sl_token'

const MOCK = {
  1: { id: 1, name: 'Robinson Kimani', skills: ['React', 'UI'], about: 'Frontend engineer passionate about DX.', certificates: ['AWS Certified Cloud Practitioner.pdf', 'PMI Agile Foundations.png'] },
  2: { id: 2, name: 'Brian Mbeumo', skills: ['Node', 'API', 'DB'], about: 'Backend engineer and API design.', certificates: [] },
  3: { id: 3, name: 'ian NJunge', skills: ['Python', 'ML'], about: 'Data scientist and ML tutor.', certificates: [] },
  4: { id: 4, name: 'Gideon lenkai', skills: ['Flutter', 'Dart'], about: 'Mobile developer building cross-platform apps.', certificates: [] },
}

export default function MentorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const mentor = useMemo(() => MOCK[id] || { id, name: 'Mentor', skills: [], about: '', certificates: [] }, [id])

  const reviewsKey = `sl_reviews_${mentor.id}`
  const [reviews, setReviews] = useState(() => { try { return JSON.parse(localStorage.getItem(reviewsKey))||[] } catch { return [] } })
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const avg = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : '—'

  const submitReview = (e) => {
    e.preventDefault()
    if (!user || user.role!=='learner') return alert('Only learners can leave reviews')
    const item = { id: Date.now(), by: user.email||user.name, rating: Number(rating), comment: comment.trim(), time: new Date().toISOString() }
    const next = [...reviews, item]
    setReviews(next)
    localStorage.setItem(reviewsKey, JSON.stringify(next))
    setComment('')
  }

  const reqKey = 'sl_requests'
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const requestMentorship = async (e) => {
    e.preventDefault()
    if (!user || user.role!=='learner') return alert('Login as a learner to request mentorship')
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return alert('Session expired. Please login again.')
    try {
      const res = await fetch(`${BASE_URL}/requests/`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mentor_id: Number(mentor.id), topic: topic.trim(), message: message.trim() })
      })
      const data = await res.json().catch(()=> ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to send request')
      // store a minimal local copy for quick UI; source of truth is API
      const list = (()=>{ try { return JSON.parse(localStorage.getItem(reqKey))||[] } catch { return [] } })()
      const item = { id: data.id || Date.now(), mentorId: mentor.id, mentorName: mentor.name, learnerEmail: user.email, topic, message, status: (data.status||'pending').replace(/^./, c=>c.toUpperCase()) }
      localStorage.setItem(reqKey, JSON.stringify([item, ...list]))
      alert('Request sent. You can track it in your Requests page.')
      setTopic(''); setMessage('')
      navigate('/requests')
    } catch (err) {
      alert(err.message || 'Failed to send request')
    }
  }

  return (
    <div className="container" style={{paddingTop: 24}}>
      <div className="badge" style={{marginBottom: 8}}>Mentor Profile</div>

      <div className="card">
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <div className="avatar" />
          <div>
            <div className="title-md" style={{margin:0}}>{mentor.name}</div>
            <div className="tags" style={{marginTop:8}}>
              {mentor.skills.map((s,i) => (<span key={i} className="tag">{s}</span>))}
            </div>
            <div className="muted" style={{fontSize:14, marginTop:6}}>Average rating: {avg}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <h2 className="title-md">About</h2>
        <p className="muted" style={{marginTop:8}}>{mentor.about || '—'}</p>
      </div>

      {mentor.certificates.length > 0 && (
        <div className="card" style={{marginTop:16}}>
          <h2 className="title-md">Certificates</h2>
          <div className="form" style={{marginTop:8}}>
            {mentor.certificates.map((c,i) => (
              <div key={i} className="card" style={{padding:12, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <span>{c}</span>
                <button className="button">View</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{marginTop:16}}>
        <h2 className="title-md">Request Mentorship</h2>
        <form onSubmit={requestMentorship} className="form" style={{marginTop:8}}>
          <input className="input" placeholder="Topic (e.g., React state)" value={topic} onChange={e=>setTopic(e.target.value)} />
          <textarea className="input" placeholder="Describe what you need help with" value={message} onChange={e=>setMessage(e.target.value)} rows={4} />
          <button className="button button-primary">Send Request</button>
        </form>
      </div>

      <div className="card" style={{marginTop:16}}>
        <h2 className="title-md">Reviews</h2>
        <form onSubmit={submitReview} className="form" style={{marginTop:8}}>
          <select className="input" value={rating} onChange={e=>setRating(e.target.value)}>
            {[5,4,3,2,1].map(r=> <option key={r} value={r}>{r} stars</option>)}
          </select>
          <textarea className="input" placeholder="Share your experience" value={comment} onChange={e=>setComment(e.target.value)} rows={3} />
          <button className="button">Submit Review</button>
        </form>
        <div className="form" style={{marginTop:12}}>
          {reviews.map(r => (
            <div key={r.id} className="card" style={{padding:12}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div><strong>{r.by}</strong> • {r.rating}★</div>
                <div className="muted" style={{fontSize:12}}>{new Date(r.time).toLocaleString()}</div>
              </div>
              <div style={{marginTop:6}}>{r.comment}</div>
            </div>
          ))}
          {reviews.length===0 && <div className="muted">No reviews yet.</div>}
        </div>
      </div>
    </div>
  )
}
