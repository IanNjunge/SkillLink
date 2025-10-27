export default function Home() {
	return (
		<div className="container" style={{paddingTop: 24}}>
			<div className="card" style={{padding: 32}}>
				<div style={{display:'flex', flexDirection:'column', gap:16}}>
					<div>
						<div className="badge">SkillLink</div>
					</div>
					<h1 className="title-xl">Connect, Learn, Grow.</h1>
					<p className="muted">The peer learning and mentorship platform that makes skill development easy.</p>
					<div>
						<a href="/mentors" className="button button-primary">Get Started</a>
					</div>
				</div>
				<div style={{marginTop:24, fontSize:12}} className="muted">Designed by Robinson Kimani, Ian Njunge, Odindo Naliyo, Wilson Nyachiengno</div>
			</div>
		</div>
	)
}
