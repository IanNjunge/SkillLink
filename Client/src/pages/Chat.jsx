import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'
const TOKEN_KEY = 'sl_token'

export default function Chat() {
  const { mentorId } = useParams() // can be conversation id (from inbox) or mentor id (starting new chat)
  const [headerName, setHeaderName] = useState('Direct messages')
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const endRef = useRef(null)

  // helper to fetch with auth
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem(TOKEN_KEY)
    return fetch(url, { ...(options||{}), headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers||{}) } })
  }

  // load or create conversation
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      // Try treat param as conversation id first
      try {
        const res = await authFetch(`${BASE_URL}/conversations/${mentorId}/messages`)
        if (res.ok) {
          // We have a conversation id
          const msgs = await res.json()
          if (cancelled) return
          // fetch conversation list to get names and pick this one
          const convRes = await authFetch(`${BASE_URL}/conversations`)
          if (convRes.ok) {
            const list = await convRes.json()
            const found = list.find(c => String(c.id) === String(mentorId))
            if (found) {
              setConversation(found)
              setHeaderName(found.other?.name || 'Direct messages')
            }
          }
          setMessages(msgs.map(m => ({
            id: m.id,
            from: (conversation && m.sender_id === conversation.other?.id) ? 'other' : undefined, // will normalize below after conv fetch
            sender_id: m.sender_id,
            text: m.text,
            time: m.created_at
          })))
          return
        }
      } catch {}

      // Otherwise, create/get conversation by mentor id (learner initiating chat)
      try {
        const res = await authFetch(`${BASE_URL}/conversations`, {
          method: 'POST',
          body: JSON.stringify({ mentor_id: Number(mentorId) })
        })
        if (!res.ok) throw new Error(await res.text().catch(()=>''))
        const conv = await res.json()
        if (cancelled) return
        setConversation(conv)
        setHeaderName(conv.other?.name || 'Direct messages')
        const msgsRes = await authFetch(`${BASE_URL}/conversations/${conv.id}/messages`)
        const msgs = msgsRes.ok ? await msgsRes.json() : []
        setMessages(msgs.map(m => ({ id: m.id, from: m.sender_id === conv.other?.id ? 'other' : 'me', text: m.text, time: m.created_at })))
      } catch (e) {
        // fallback header
        setHeaderName('Direct messages')
      }
    }
    load()
    const timer = setInterval(load, 4000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [mentorId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim() || !conversation?.id) return
    const payload = { text: text.trim() }
    setText('')
    try {
      const res = await authFetch(`${BASE_URL}/conversations/${conversation.id}/messages`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(await res.text().catch(()=>''))
      const m = await res.json()
      setMessages(prev => [...prev, { id: m.id, from: 'me', text: m.text, time: m.created_at }])
    } catch (e) {
      // ignore for now
    }
  }

  return (
    <div className="container" style={{paddingTop: 16}}>
      <div className="card" style={{padding:'12px 16px', marginBottom: 12, display:'flex', alignItems:'center', gap:12}}>
        <div className="avatar" />
        <div>
          <div className="title-md" style={{margin:0}}>{headerName}</div>
          <div className="muted" style={{fontSize:12}}>Direct messages</div>
        </div>
      </div>

      <div className="card" style={{height: '50vh', overflowY: 'auto', display:'flex', flexDirection:'column', gap:8, padding:12}}>
        {messages.map((m, i) => (
          <div key={m.id || i} style={{display:'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start'}}>
            <div style={{maxWidth:'70%', background: m.from === 'me' ? 'var(--primary)' : '#eef1f5', color: m.from === 'me' ? '#fff' : '#111', padding:'10px 12px', borderRadius:12}}>
              {m.text && <div style={{whiteSpace:'pre-wrap'}}>{m.text}</div>}
              <div className="muted" style={{fontSize:10, marginTop:4, opacity:0.9, display:'flex', gap:8, alignItems:'center'}}>
                <span>{new Date(m.time).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} style={{display:'flex', gap:8, marginTop:12, alignItems:'center', flexWrap:'wrap'}}>
        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="Type your message..."
          style={{flex:1, background:'#eef1f5', border:'none', padding:'14px 16px', borderRadius:'var(--radius)', outline:'none', fontSize:16}}
        />
        <button className="button button-primary" style={{padding:'12px 16px', borderRadius:'var(--radius)'}}>Send</button>
      </form>
    </div>
  )
}
