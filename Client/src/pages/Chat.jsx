import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

const MOCK_MENTORS = {
  1: { id: 1, name: 'Alice Kim' },
  2: { id: 2, name: 'Brian Odhiambo' },
  3: { id: 3, name: 'Cynthia Wanjiru' },
  4: { id: 4, name: 'David Mwangi' },
}

export default function Chat() {
  const { mentorId } = useParams()
  const mentor = useMemo(() => MOCK_MENTORS[mentorId] || { id: mentorId, name: 'Mentor' }, [mentorId])
  const storageKey = `sl_chat_${mentor.id}`

  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || [] } catch { return [] }
  })
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const endRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages))
  }, [messages, storageKey])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (e) => {
    e.preventDefault()
    if (!text.trim() && !file) return
    const now = new Date().toISOString()
    const isImage = file && file.type && file.type.startsWith('image/')
    let fileUrl = null
    let fileName = null
    if (file) {
      fileUrl = URL.createObjectURL(file)
      fileName = file.name
    }
    const pending = { from: 'me', text: text.trim(), time: now, status: 'sending', fileUrl, fileName, isImage }
    setMessages(prev => [...prev, pending])
    setText('')
    setFile(null)
    // mock mentor autoreply
    setTimeout(() => {
      // mark last my message delivered
      setMessages(prev => {
        const copy = [...prev]
        const idx = copy.slice().reverse().findIndex(m => m.from==='me' && m.status==='sending')
        if (idx !== -1) {
          const pos = copy.length - 1 - idx
          copy[pos] = { ...copy[pos], status: 'delivered' }
        }
        return copy
      })
      setMessages(prev => [...prev, { from: 'mentor', text: 'Thanks for your message! I\'ll get back to you shortly.', time: new Date().toISOString() }])
    }, 800)
    // simulate read after a while
    setTimeout(() => {
      setMessages(prev => {
        const copy = [...prev]
        const idx = copy.slice().reverse().findIndex(m => m.from==='me' && m.status==='delivered')
        if (idx !== -1) {
          const pos = copy.length - 1 - idx
          copy[pos] = { ...copy[pos], status: 'read' }
        }
        return copy
      })
    }, 2000)
  }

  // mark all mentor messages as read when page opens
  useEffect(() => {
    if (!messages.length) return
    const updated = messages.map(m => (m.from !== 'me' ? { ...m, readAt: m.readAt || new Date().toISOString() } : m))
    setMessages(updated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container" style={{paddingTop: 16}}>
      <div className="card" style={{padding:'12px 16px', marginBottom: 12, display:'flex', alignItems:'center', gap:12}}>
        <div className="avatar" />
        <div>
          <div className="title-md" style={{margin:0}}>{mentor.name}</div>
          <div className="muted" style={{fontSize:12}}>Direct messages</div>
        </div>
      </div>

      <div className="card" style={{height: '50vh', overflowY: 'auto', display:'flex', flexDirection:'column', gap:8, padding:12}}>
        {messages.map((m, i) => (
          <div key={i} style={{display:'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start'}}>
            <div style={{maxWidth:'70%', background: m.from === 'me' ? 'var(--primary)' : '#eef1f5', color: m.from === 'me' ? '#fff' : '#111', padding:'10px 12px', borderRadius:12}}>
              {m.fileUrl && m.isImage && (
                <img src={m.fileUrl} alt={m.fileName} style={{maxWidth:'100%', borderRadius:8, marginBottom:6}} />
              )}
              {m.fileUrl && !m.isImage && (
                <a href={m.fileUrl} download={m.fileName} style={{color: m.from==='me' ? '#fff' : '#111', textDecoration:'underline'}}>{m.fileName}</a>
              )}
              {m.text && <div style={{whiteSpace:'pre-wrap'}}>{m.text}</div>}
              <div className="muted" style={{fontSize:10, marginTop:4, opacity:0.9, display:'flex', gap:8, alignItems:'center'}}>
                <span>{new Date(m.time).toLocaleTimeString()}</span>
                {m.from==='me' && m.status && <span>• {m.status}</span>}
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
        <label className="button" style={{cursor:'pointer'}}>
          Attach
          <input type="file" accept="image/*,application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} style={{display:'none'}} />
        </label>
        {file && <span className="muted" style={{fontSize:12}}>{file.name}</span>}
        <button className="button button-primary" style={{padding:'12px 16px', borderRadius:'var(--radius)'}}>Send</button>
      </form>
    </div>
  )
}
