import { useState } from 'react'

export default function Profile() {
  const [skills, setSkills] = useState(['React'])
  const [newSkill, setNewSkill] = useState('')

  const addSkill = () => {
    if (!newSkill.trim()) return
    setSkills([...skills, newSkill.trim()])
    setNewSkill('')
  }

  return (
    <div className="container" style={{padding: 0}}>
      <h1 className="title-lg">Profile & Skills</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input className="input" placeholder="Add a skill" value={newSkill} onChange={e=>setNewSkill(e.target.value)} />
          <button onClick={addSkill} className="button button-primary">Add</button>
        </div>
        <div className="tags">
          {skills.map((s, i) => (
            <span key={i} className="tag">{s}</span>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 className="title-md">Evidence Upload</h2>
        <input type="file" accept="image/*,application/pdf" />
        {/* TODO: send to backend or Cloud storage */}
      </div>
    </div>
  )
}