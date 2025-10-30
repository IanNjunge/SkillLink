 import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'

export default function SearchMentors() {
  const [query, setQuery] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [skillFilter, setSkillFilter] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (skillFilter) params.set('skill', skillFilter)
    fetch(`${BASE_URL}/mentors?${params.toString()}`)
      .then(async r => { if (!r.ok) throw new Error(await r.text().catch(()=>'')); return r.json() })
      .then(data => { if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []) })
      .catch(() => { if (!cancelled) setError('Failed to load mentors') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [query, skillFilter])

  const allSkills = useMemo(() => Array.from(new Set(items.flatMap(m => m.skills || []))), [items])

  const filtered = useMemo(() => {
    let list = items
    if (minRating) list = list.filter(m => (m.avg_rating || 0) >= minRating)
    return list
  }, [items, minRating])

  return (
    <div className="container" style={{paddingTop: 16}}>
      <h1 className="title-lg">Search Mentors</h1>
      <div className="card" style={{margin:'12px 0', padding:16, display:'grid', gap:12}}>
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Search by name, skill, or title..."
          style={{background:'#eef1f5', border:'none', padding:'14px 16px', borderRadius:'var(--radius)', outline:'none', fontSize:16, width:'100%'}}
        />
        <div style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'center'}}>
          <label className="muted" style={{fontSize:14}}>Min rating</label>
          <select value={minRating} onChange={e=>setMinRating(Number(e.target.value))} className="input" style={{width:120}}>
            <option value={0}>Any</option>
            <option value={4.5}>4.5+</option>
            <option value={4.7}>4.7+</option>
            <option value={4.9}>4.9+</option>
          </select>
          <div className="tags">
            {allSkills.map(s => (
              <button key={s} className="tag" onClick={()=> setSkillFilter(skillFilter===s ? '' : s)} style={{cursor:'pointer', border: skillFilter===s ? '2px solid var(--primary)' : undefined}}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="card" style={{padding:12, background:'#ffe5e5', color:'#a40000'}}>{error}</div>}
      {loading && <div className="card">Loading...</div>}
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))'}}>
        {filtered.map(m => (
          <div key={m.id} className="card" style={{display:'flex', flexDirection:'column', gap:10}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div className="avatar" />
              <div>
                <div style={{fontWeight:700}}>{m.name}</div>
                <div className="muted" style={{fontSize:14}}>{(m.skills||[]).slice(0,2).join(' • ')}</div>
              </div>
            </div>
            <div className="tags">
              {(m.skills||[]).map(s => (<span key={s} className="tag">{s}</span>))}
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8}}>
              <div className="muted" style={{fontSize:14}}>⭐ {m.avg_rating ? m.avg_rating.toFixed(1) : '—'}</div>
              <div style={{display:'flex', gap:8}}>
                <button className="button" onClick={()=>navigate(`/chat/${m.id}`)}>Message</button>
                <button className="button button-primary" onClick={()=>navigate(`/mentor/${m.id}`)}>View Profile</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}