 import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function Dashboard() {
  return (
    <div className="container" style={{padding: 0}}>
      <h1 className="title-lg">Mentorship Dashboard</h1>
      <p className="muted">View and manage incoming mentorship requests.</p>
      <div className="card">
        <Calendar />
      </div>
      {/* TODO: list requests from backend */}
    </div>
  )
}