 import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MOCK_MENTORS = [
  { id: 1, name: 'Robinson Kimani', verifiedIcon:'/home/ian/Pictures/verify.png', title: 'Frontend Engineer', skills: ['React','JS','UI'], rating: 4.8 },
  { id: 2, name: 'Brian Mbeumo', verifiedIcon:'/home/ian/Pictures/verify.png', title: 'Backend Engineer', skills: ['Node','API','DB'], rating: 4.6 },
  { id: 3, name: 'ian NJunge', verifiedIcon:'/home/ian/Pictures/verify.png', title: 'Data Scientist', skills: ['Python','ML','Pandas'], rating: 4.9 },
  { id: 4, name: 'Gideon lenkai', verifiedIcon:'/home/ian/Pictures/verify.png', title: 'Mobile Dev', skills: ['Flutter','Dart'], rating: 4.5 },
]

export default function SearchMentors() {
  const [query, setQuery] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [skillFilter, setSkillFilter] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = MOCK_MENTORS.filter(m => (
      !q || m.name.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.skills.join(' ').toLowerCase().includes(q)
    ))
    if (minRating) list = list.filter(m => m.rating >= minRating)
    if (skillFilter) list = list.filter(m => m.skills.map(s=>s.toLowerCase()).includes(skillFilter.toLowerCase()))
    return list
  }, [query, minRating, skillFilter])

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
            {Array.from(new Set(MOCK_MENTORS.flatMap(m=>m.skills))).map(s => (
              <button key={s} className="tag" onClick={()=> setSkillFilter(skillFilter===s ? '' : s)} style={{cursor:'pointer', border: skillFilter===s ? '2px solid var(--primary)' : undefined}}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))'}}>
        {filtered.map(m => (
          <div key={m.id} className="card" style={{display:'flex', flexDirection:'column', gap:10}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div className="avatar" />
              <div>
                <div style={{fontWeight:700}}>{m.name}</div>
                <div className="muted" style={{fontSize:14}}>{m.title}</div>
              </div>
            </div>
            <div className="tags">
              {m.skills.map(s => (<span key={s} className="tag">{s}</span>))}
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8}}>
              <div className="muted" style={{fontSize:14}}>⭐ {m.rating}</div>
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