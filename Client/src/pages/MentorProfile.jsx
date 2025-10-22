 export default function MentorProfile() {
  const mentor = {
    name: 'Robinson Kimani',
    skills: ['Python', 'Project Management'],
    about: 'These locations checking were to assess on how to plan processes not only on desktop, all-liked. This cloud and workplaces.',
    certificates: [
      { id: 1, name: 'AWS Certified Cloud Practitioner.pdf' },
      { id: 2, name: 'PMI Agile Foundations.png' },
    ],
  }

  return (
    <div className="container" style={{paddingTop: 24}}>
      <div className="badge" style={{marginBottom: 8}}>Mentor Profile / Skill Verification</div>
      <div className="card">
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <div className="avatar" />
          <div>
            <div className="title-md" style={{margin:0}}>{mentor.name}</div>
            <div className="tags" style={{marginTop:8}}>
              {mentor.skills.map((s,i) => (<span key={i} className="tag">{s}</span>))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <h2 className="title-md">About</h2>
        <p className="muted" style={{marginTop:8}}>{mentor.about}</p>
      </div>

      <div className="card" style={{marginTop:16}}>
        <h2 className="title-md">Certificates</h2>
        <div className="form" style={{marginTop:8}}>
          {mentor.certificates.map(c => (
            <div key={c.id} className="card" style={{padding:12, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span>{c.name}</span>
              <button className="button">View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}