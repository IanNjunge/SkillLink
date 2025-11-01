from app import create_app
from extensions import db
from datetime import datetime, timedelta
from models import User, Skill, UserSkill, MentorshipRequest, Review, Session


def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        # Users
        admin = User(name='Admin', email='admin@skilllink.com', role='admin')
        admin.set_password('admin123')
        mentor1 = User(name='Robinson Kimani', email='mentor1@example.com', role='mentor', verified=True)
        mentor1.set_password('password')
        mentor2 = User(name='Brian Mbeumo', email='mentor2@example.com', role='mentor', verified=True)
        mentor2.set_password('password')
        mentor3 = User(name='Ian Njunge', email='mentor3@example.com', role='mentor', verified=True)
        mentor3.set_password('password')
        mentor4 = User(name='Gideon lenkai', email='mentor4@example.com', role='mentor', verified=True)
        mentor4.set_password('password')

        learner = User(name='Learner One', email='learner1@example.com', role='learner')
        learner.set_password('password')

        db.session.add_all([admin, mentor1, mentor2, mentor3, mentor4, learner])
        db.session.flush()

        # Skills
        def add_skill(user, name):
            sk = Skill.query.filter(Skill.name.ilike(name)).first()
            if not sk:
                sk = Skill(name=name)
                db.session.add(sk)
                db.session.flush()
            db.session.add(UserSkill(user_id=user.id, skill_id=sk.id))

        # Robinson Kimani
        add_skill(mentor1, 'React')
        add_skill(mentor1, 'JS')
        add_skill(mentor1, 'UI')
        # Brian Mbeumo
        add_skill(mentor2, 'Node')
        add_skill(mentor2, 'API')
        add_skill(mentor2, 'DB')
        # Ian Njunge
        add_skill(mentor3, 'Python')
        add_skill(mentor3, 'ML')
        add_skill(mentor3, 'Pandas')
        # Gideon lenkai
        add_skill(mentor4, 'Flutter')
        add_skill(mentor4, 'Dart')

        # Sample mentorship requests (with booking preferences)
        req = MentorshipRequest(
            learner_id=learner.id,
            mentor_id=mentor1.id,
            topic='State management',
            message='Need help with React hooks',
            preferred_time=datetime.utcnow() + timedelta(days=1),
            duration_minutes=60,
        )
        db.session.add(req)
        db.session.flush()

        # Mark one request as accepted and create a scheduled session
        req.status = 'accepted'
        sess = Session(
            mentor_id=mentor1.id,
            learner_id=learner.id,
            request_id=req.id,
            start_time=req.preferred_time or (datetime.utcnow() + timedelta(days=1)),
            duration_minutes=req.duration_minutes or 60,
            status='scheduled',
        )
        db.session.add(sess)

        # Sample reviews to approximate ratings
        db.session.add(Review(mentor_id=mentor1.id, learner_id=learner.id, rating=5, comment='Great session!'))  # ~4.8
        db.session.add(Review(mentor_id=mentor2.id, learner_id=learner.id, rating=4, comment='Helpful backend advice'))  # ~4.6
        db.session.add(Review(mentor_id=mentor3.id, learner_id=learner.id, rating=5, comment='Excellent DS guidance'))  # ~4.9
        db.session.add(Review(mentor_id=mentor4.id, learner_id=learner.id, rating=4, comment='Good mobile pointers'))  # ~4.5

        db.session.commit()
        print('Seed complete: users, skills, requests, sessions, reviews')


if __name__ == '__main__':
    seed()
