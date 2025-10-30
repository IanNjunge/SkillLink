from flask import Blueprint, request, jsonify
from sqlalchemy import func
from flask_jwt_extended import jwt_required
from extensions import db
from models import User, Skill, UserSkill, Review

mentors_bp = Blueprint('mentors', __name__)


def mentor_to_dict(u: User, avg_rating=None):
    skills = [us.skill.name for us in u.skills]
    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role,
        "verified": bool(getattr(u, 'verified', False)),
        "skills": skills,
        "avg_rating": float(avg_rating) if avg_rating is not None else None,
    }


@mentors_bp.get('/')
@jwt_required(optional=True)
def list_mentors():
    q = (request.args.get('q') or '').lower().strip()
    skill = (request.args.get('skill') or '').strip()
    try:
        page = max(1, int(request.args.get('page', 1)))
    except ValueError:
        page = 1
    try:
        page_size = max(1, min(100, int(request.args.get('page_size', 10))))
    except ValueError:
        page_size = 10

    mentors_q = User.query.filter_by(role='mentor', verified=True)

    if q:
        mentors_q = mentors_q.filter(func.lower(User.name).contains(q))

    if skill:
        mentors_q = mentors_q.join(UserSkill, UserSkill.user_id == User.id) \
                           .join(Skill, Skill.id == UserSkill.skill_id) \
                           .filter(func.lower(Skill.name) == skill.lower())

    avg_sub = db.session.query(
        Review.mentor_id,
        func.avg(Review.rating).label('avg')
    ).group_by(Review.mentor_id).subquery()

    total = mentors_q.with_entities(func.count(func.distinct(User.id))).scalar() or 0

    rows = mentors_q.outerjoin(avg_sub, avg_sub.c.mentor_id == User.id) \
                   .add_columns(avg_sub.c.avg) \
                   .order_by(User.created_at.desc()) \
                   .limit(page_size).offset((page-1)*page_size).all()

    items = [mentor_to_dict(u, avg) for (u, avg) in rows]
    return jsonify({"items": items, "total": total, "page": page, "page_size": page_size})


@mentors_bp.get('/<int:mentor_id>')
@jwt_required(optional=True)
def get_mentor(mentor_id: int):
    u = User.query.filter_by(id=mentor_id, role='mentor', verified=True).first()
    if not u:
        return jsonify({"error":"NotFound","message":"Mentor not found"}), 404

    avg = db.session.query(func.avg(Review.rating)).filter(Review.mentor_id == u.id).scalar()
    return jsonify(mentor_to_dict(u, avg))