 import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function Dashboard() {
  return (
    <div className="container" style={{paddingTop: 16}}>
      <h1 className="title-lg">Mentorship Dashboard</h1>
      <p className="muted">Overview of your activity and schedule.</p>

      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', margin:'12px 0'}}>
        <div className="card"><div className="muted" style={{fontSize:12}}>Pending Requests</div><div style={{fontSize:28, fontWeight:700}}>3</div></div>
        <div className="card"><div className="muted" style={{fontSize:12}}>Upcoming Sessions</div><div style={{fontSize:28, fontWeight:700}}>2</div></div>
        <div className="card"><div className="muted" style={{fontSize:12}}>Mentors Connected</div><div style={{fontSize:28, fontWeight:700}}>5</div></div>
        <div className="card"><div className="muted" style={{fontSize:12}}>Avg Rating</div><div style={{fontSize:28, fontWeight:700}}>4.7</div></div>
      </div>

      <div className="card">
        <Calendar />
      </div>
    </div>
  )
}