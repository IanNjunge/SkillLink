 import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function MentorDashboard() {
  const skills = ['Python', 'Project Management']

  return (
    <div className="container" style={{paddingTop: 24}}>
      <div className="badge" style={{marginBottom: 8}}>Mentor Dashboard</div>
      <div className="cols-2">
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <h2 className="title-md" style={{margin:0}}>Skills</h2>
            <button className="button button-primary">Add Skill</button>
          </div>
          <div className="form" style={{marginBottom:12}}>
            <input className="input" placeholder="Search for a skill..." />
          </div>
          <div className="form">
            {skills.map((s,i) => (
              <div key={i} className="card" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:12}}>
                <span>{s}</span>
                <button className="button">Edit</button>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2 className="title-md" style={{margin:0}}>Sessions</h2>
            <span className="muted">January</span>
          </div>
          <div style={{marginTop:12}}>
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  )
}