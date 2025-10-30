from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc
from extensions import db
from models import Review, User

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.get('/<int:mentor_id>')
@jwt_required(optional=True)
def list_reviews(mentor_id: int):
    if not User.query.filter_by(id=mentor_id, role='mentor').first():
        return jsonify({"error":"NotFound","message":"Mentor not found"}), 404
    items = Review.query.filter_by(mentor_id=mentor_id).order_by(desc(Review.created_at)).all()
    return jsonify([{ 'id':r.id, 'rating': r.rating, 'comment': r.comment, 'created_at': r.created_at.isoformat() } for r in items])


@reviews_bp.post('/<int:mentor_id>')
@jwt_required()
def add_review(mentor_id: int):
    ident = get_jwt_identity()
    if ident.get('role') != 'learner':
        return jsonify({"error":"Forbidden","message":"Learner only"}), 403
    if not User.query.filter_by(id=mentor_id, role='mentor').first():
        return jsonify({"error":"NotFound","message":"Mentor not found"}), 404
    data = request.get_json() or {}
    rating = int(data.get('rating') or 0)
    comment = (data.get('comment') or '').strip()
    if rating < 1 or rating > 5:
        return jsonify({"error":"ValidationError","message":"rating 1-5"}), 400
    r = Review(mentor_id=mentor_id, learner_id=ident['id'], rating=rating, comment=comment)
    db.session.add(r)
    db.session.commit()
    return jsonify({"id": r.id}), 201