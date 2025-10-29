 import { Link } from 'react-router-dom'

export default function MentorCard({ mentor }) {
  return (
    <div className="card">
      <div className="title-md">
        {mentor.id ? (
          <Link to={`/mentor/${mentor.id}`} className="nav-link" style={{padding:0, border:'none'}}>{mentor.name}</Link>
        ) : mentor.name}
      </div>
      <div className="muted">{mentor.skills?.join(', ')}</div>
      {mentor.links?.github && (
        <a className="nav-link" href={mentor.links.github} target="_blank" rel="noreferrer">GitHub</a>
      )}
    </div>
  )
}
