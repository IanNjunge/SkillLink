from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import User


users_bp = Blueprint("users", __name__)


@users_bp.post("/register")
def register():
	data = request.get_json() or {}
	email = (data.get("email") or "").strip().lower()
	password = (data.get("password") or "").strip()
	name = (data.get("name") or "").strip() or None
	role = (data.get("role") or "learner").strip()
	if not User.is_valid_email(email):
		return jsonify({"error": "invalid email"}), 400
	if len(password) < 8:
		return jsonify({"error": "password must be at least 8 characters"}), 400
	if role not in {"learner", "mentor", "admin"}:
		return jsonify({"error": "invalid role"}), 400
	if User.query.filter_by(email=email).first():
		return jsonify({"error": "email already registered"}), 409
	user = User(email=email, name=name, role=role)
	user.set_password(password)
	db.session.add(user)
	db.session.commit()
	return jsonify(user.to_dict()), 201


@users_bp.post("/login")
def login():
	data = request.get_json() or {}
	email = (data.get("email") or "").strip().lower()
	password = (data.get("password") or "").strip()
	if not User.is_valid_email(email):
		return jsonify({"error": "invalid email"}), 400
	user = User.query.filter_by(email=email).first()
	if not user or not user.check_password(password):
		return jsonify({"error": "invalid email or password"}), 401
	return jsonify(user.to_dict()), 200


@users_bp.get("")
def list_users():
	users = User.query.order_by(User.id.desc()).all()
	return jsonify([u.to_dict() for u in users])
