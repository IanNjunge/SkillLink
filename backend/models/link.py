from datetime import datetime
from ..extensions import db


class Link(db.Model):
	__tablename__ = "links"

	id = db.Column(db.Integer, primary_key=True)
	url = db.Column(db.String(2048), nullable=False)
	title = db.Column(db.String(512), nullable=True)
	notes = db.Column(db.Text, nullable=True)
	user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
	created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
	updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

	user = db.relationship("User", back_populates="links")

	def to_dict(self):
		return {
			"id": self.id,
			"url": self.url,
			"title": self.title,
			"notes": self.notes,
			"user_id": self.user_id,
			"created_at": self.created_at.isoformat(),
			"updated_at": self.updated_at.isoformat(),
		}
