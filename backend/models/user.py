from datetime import datetime
import re
from ..extensions import db
from werkzeug.security import generate_password_hash, check_password_hash


EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class User(db.Model):
	__tablename__ = "users"

	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(255), unique=True, nullable=False)
	name = db.Column(db.String(255), nullable=True)
	role = db.Column(db.String(50), nullable=False, default="learner")
	password_hash = db.Column(db.String(255), nullable=True)
	created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

	links = db.relationship("Link", back_populates="user", cascade="all, delete-orphan")
	mentor_profile = db.relationship("MentorProfile", back_populates="user", uselist=False)

	def set_password(self, password: str) -> None:
		self.password_hash = generate_password_hash(password)

	def check_password(self, password: str) -> bool:
		if not self.password_hash:
			return False
		return check_password_hash(self.password_hash, password)

	@staticmethod
	def is_valid_email(email: str) -> bool:
		return bool(EMAIL_REGEX.match(email or ""))

	def to_dict(self):
		return {
			"id": self.id,
			"email": self.email,
			"name": self.name,
			"role": self.role,
			"created_at": self.created_at.isoformat(),
		}
