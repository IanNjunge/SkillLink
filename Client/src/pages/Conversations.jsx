import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const KEY_PREFIX = 'sl_chat_'

function listThreads() {
  const threads = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(KEY_PREFIX)) {
      const peerId = k.substring(KEY_PREFIX.length)
      try {
        const msgs = JSON.parse(localStorage.getItem(k) || '[]')
        if (msgs.length) {
          const last = msgs[msgs.length - 1]
          const unread = msgs.filter(m => m.from !== 'me' && !m.readAt).length
          // naive peer name placeholder
          threads.push({ peerId, name: `Mentor ${peerId}`, last, unread })
        }
      } catch {}
    }
  }
  threads.sort((a,b)=> new Date(b.last?.time||0) - new Date(a.last?.time||0))
  return threads
}

export default function Conversations() {
  const [items, setItems] = useState(listThreads())
  const navigate = useNavigate()

  useEffect(() => {
    const refresh = () => setItems(listThreads())
    window.addEventListener('storage', refresh)
    const timer = setInterval(refresh, 1000)
    return () => { window.removeEventListener('storage', refresh); clearInterval(timer) }
  }, [])

  return (
    <div className="container" style={{paddingTop:16}}>
      <h1 className="title-lg">Inbox</h1>
      <div className="grid" style={{gridTemplateColumns:'1fr'}}>
        {items.length === 0 && <div className="card">No conversations yet.</div>}
        {items.map(t => (
          <div key={t.peerId} className="card" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div className="avatar" />
              <div>
                <div style={{fontWeight:700}}>{t.name}</div>
                <div className="muted" style={{fontSize:12, maxWidth:420, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {t.last?.text || t.last?.fileName || '—'}
                </div>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              {t.unread > 0 && <span className="badge" style={{padding:'4px 8px'}}>{t.unread}</span>}
              <button className="button button-primary" onClick={()=>navigate(`/chat/${t.peerId}`)}>Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
