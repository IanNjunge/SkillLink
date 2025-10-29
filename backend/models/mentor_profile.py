from ..extensions import db
from .associations import mentor_topic_association


class MentorProfile(db.Model):
	__tablename__ = "mentor_profiles"

	id = db.Column(db.Integer, primary_key=True)
	bio = db.Column(db.Text, nullable=True)
	rate = db.Column(db.Float, nullable=True)
	user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)

	user = db.relationship("User", back_populates="mentor_profile")
	topics = db.relationship("Topic", secondary=mentor_topic_association, back_populates="mentors")
