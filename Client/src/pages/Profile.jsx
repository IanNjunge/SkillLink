import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load skills on mount
  useEffect(() => {
    fetch('/skills/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setSkills(data.skills || []))
      .catch(err => setError('Failed to load skills'))
      .finally(() => setLoading(false))
  }, [])

  const addSkill = async () => {
    if (!newSkill.trim()) return
    try {
      const res = await fetch('/skills/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSkill.trim() }),
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to add skill')
      const data = await res.json()
      setSkills(data.user.skills || [])
      setNewSkill('')
      setError('')
    } catch (err) {
      setError('Failed to add skill')
    }
  }

  const removeSkill = async (skillId) => {
    try {
      const res = await fetch(`/skills/me/${skillId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to remove skill')
      const data = await res.json()
      setSkills(data.user.skills || [])
      setError('')
    } catch (err) {
      setError('Failed to remove skill')
    }
  }

  const uploadFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      // TODO: Show upload success
      console.log('Uploaded:', data)
    } catch (err) {
      setError('Upload failed')
    }
  }

  if (!user) return null

  return (
    <div className="container" style={{padding: 0}}>
      <h1 className="title-lg">Profile & Skills</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input 
            className="input" 
            placeholder="Add a skill" 
            value={newSkill} 
            onChange={e => setNewSkill(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addSkill()}
          />
          <button 
            onClick={addSkill} 
            className="button button-primary"
            disabled={!newSkill.trim() || loading}
          >
            Add
          </button>
        </div>
        {error && <div style={{ color: 'var(--red)', marginBottom: 12 }}>{error}</div>}
        <div className="tags">
          {loading ? (
            <div>Loading skills...</div>
          ) : skills.length === 0 ? (
            <div>No skills added yet</div>
          ) : (
            skills.map(s => (
              <span key={s.id} className="tag" style={{ display: 'inline-flex', alignItems: 'center' }}>
                {s.name}
                <button
                  onClick={() => removeSkill(s.id)}
                  className="button-icon"
                  style={{ marginLeft: 4, padding: 4 }}
                  title="Remove skill"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>
      <div className="card">
        <h2 className="title-md">Evidence Upload</h2>
        <input 
          type="file" 
          accept="image/*,application/pdf" 
          onChange={uploadFile}
          disabled={loading}
        />
      </div>
    </div>
  )
}
