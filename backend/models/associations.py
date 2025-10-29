from ..extensions import db


mentor_topic_association = db.Table(
	"mentor_topics",
	db.Column("mentor_id", db.Integer, db.ForeignKey("mentor_profiles.id"), primary_key=True),
	db.Column("topic_id", db.Integer, db.ForeignKey("topics.id"), primary_key=True),
)
