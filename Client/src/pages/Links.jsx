import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { Api, setApiBase } from '../state/api'

export default function Links() {
	const { user } = useAuth()
	const [items, setItems] = useState([])
	const [url, setUrl] = useState('')
	const [title, setTitle] = useState('')
	const [notes, setNotes] = useState('')
	const [apiBaseInput, setApiBaseInput] = useState(localStorage.getItem('sl_api_base') || 'http://localhost:5000')
	const canSubmit = useMemo(() => !!user && !!url, [user, url])

	useEffect(() => {
		if (!user) return
		Api.listLinks(user.id).then(setItems).catch(() => {})
	}, [user])

	const onSaveBase = () => {
		setApiBase(apiBaseInput)
		alert('API base URL saved')
	}

	const onAdd = async (e) => {
		e.preventDefault()
		if (!canSubmit) return
		const payload = { url, user_id: user.id, title: title || undefined, notes: notes || undefined }
		const created = await Api.createLink(payload)
		setItems([created, ...items])
		setUrl(''); setTitle(''); setNotes('')
	}

	const onDelete = async (id) => {
		await Api.deleteLink(id)
		setItems(items.filter(i => i.id !== id))
	}

	return (
		<div>
			<h2 className="title-lg">My Links</h2>
			<div style={{display:'flex', gap:12, alignItems:'center', margin:'12px 0'}}>
				<input value={apiBaseInput} onChange={e=>setApiBaseInput(e.target.value)} placeholder="API Base URL (http://localhost:5000)" style={{flex:1}} />
				<button onClick={onSaveBase} className="button">Save API URL</button>
			</div>
			<form onSubmit={onAdd} className="card" style={{display:'grid', gap:8, padding:12}}>
				<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/article" />
				<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Optional title (auto-fetched if empty)" />
				<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optional)" />
				<button disabled={!canSubmit} className="button button-primary">Add Link</button>
			</form>
			<div style={{marginTop:16, display:'grid', gap:8}}>
				{items.map(item => (
					<div key={item.id} className="card" style={{padding:12}}>
						<div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
							<div>
								<a href={item.url} target="_blank" rel="noreferrer" className="link" style={{fontWeight:600}}>{item.title || item.url}</a>
								<div style={{fontSize:12, opacity:0.7}}>{new Date(item.created_at).toLocaleString()}</div>
							</div>
							<button onClick={()=>onDelete(item.id)} className="button">Delete</button>
						</div>
						{item.notes && <p style={{marginTop:8}}>{item.notes}</p>}
					</div>
				))}
				{items.length === 0 && <div className="card" style={{padding:12}}>No links yet. Add your first above.</div>}
			</div>
		</div>
	)
}
