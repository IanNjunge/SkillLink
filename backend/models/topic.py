from ..extensions import db
from .associations import mentor_topic_association


class Topic(db.Model):
	__tablename__ = "topics"

	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(120), unique=True, nullable=False)

	mentors = db.relationship("MentorProfile", secondary=mentor_topic_association, back_populates="topics")
