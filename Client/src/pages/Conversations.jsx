import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'
const TOKEN_KEY = 'sl_token'

export default function Conversations() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY)
        const res = await fetch(`${BASE_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error(await res.text().catch(()=>''))
        const data = await res.json()
        if (!cancelled) setItems(data)
      } catch (e) {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchItems()
    const timer = setInterval(fetchItems, 5000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [])

  return (
    <div className="container" style={{paddingTop:16}}>
      <h1 className="title-lg">Inbox</h1>
      <div className="grid" style={{gridTemplateColumns:'1fr'}}>
        {loading && <div className="card">Loading...</div>}
        {!loading && items.length === 0 && <div className="card">No conversations yet.</div>}
        {items.map(t => (
          <div key={t.id} className="card" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div className="avatar" />
              <div>
                <div style={{fontWeight:700}}>{t.other?.name || 'Conversation'}</div>
                <div className="muted" style={{fontSize:12, maxWidth:420, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {t.last_message?.text || '—'}
                </div>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              {t.unread > 0 && <span className="badge" style={{padding:'4px 8px'}}>{t.unread}</span>}
              <button className="button button-primary" onClick={()=>navigate(`/chat/${t.id}`)}>Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
