from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from extensions import db
from models import User, UserSkill, Skill, Evidence

admin_bp = Blueprint('admin', __name__)


def _require_admin():
    claims = get_jwt() or {}
    return claims.get('role') == 'admin'


@admin_bp.get('/mentors')
@jwt_required()
def list_mentors_by_status():
    if not _require_admin():
        return jsonify({"error":"Forbidden","message":"Admins only"}), 403
    status = (request.args.get('status') or '').lower()
    q = User.query.filter_by(role='mentor')
    if status == 'pending':
        q = q.filter_by(verified=False)
    elif status == 'verified':
        q = q.filter_by(verified=True)
    items = q.order_by(User.created_at.desc()).all()
    result = []
    for u in items:
        try:
            skills = [us.skill.name for us in (u.skills or []) if getattr(us, 'skill', None)]
        except Exception:
            skills = []
        result.append({
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'verified': u.verified,
            'skills': skills
        })
    return jsonify(result)


@admin_bp.patch('/mentors/<int:mentor_id>/status')
@jwt_required()
def set_status(mentor_id: int):
    if not _require_admin():
        return jsonify({"error":"Forbidden","message":"Admins only"}), 403
    body = request.get_json(silent=True) or {}
    verified = bool(body.get('verified'))
    u = User.query.filter_by(id=mentor_id, role='mentor').first()
    if not u:
        return jsonify({"error":"NotFound","message":"Mentor not found"}), 404
    u.verified = verified
    db.session.commit()
    return jsonify({"message":"updated","verified":u.verified})


@admin_bp.get('/evidence')
@jwt_required()
def list_evidence():
    if not _require_admin():
        return jsonify({"error":"Forbidden","message":"Admins only"}), 403
    status = (request.args.get('status') or '').lower()
    mentor_id = request.args.get('mentor_id', type=int)
    q = Evidence.query
    if status in {'pending','approved','rejected'}:
        q = q.filter_by(status=status)
    if mentor_id:
        q = q.filter_by(mentor_id=mentor_id)
    items = q.order_by(Evidence.created_at.desc()).all()
    return jsonify([
        { 'id':e.id, 'mentor_id': e.mentor_id, 'name': e.name, 'url': e.url, 'type': e.type, 'status': e.status, 'description': e.description, 'created_at': e.created_at.isoformat() }
        for e in items
    ])


@admin_bp.patch('/evidence/<int:evidence_id>')
@jwt_required()
def review_evidence(evidence_id: int):
    if not _require_admin():
        return jsonify({"error":"Forbidden","message":"Admins only"}), 403
    body = request.get_json(silent=True) or {}
    status = (body.get('status') or '').lower()
    if status not in {'approved','rejected'}:
        return jsonify({"error":"ValidationError","message":"status must be approved|rejected"}), 400
    comment = body.get('review_comment')
    e = Evidence.query.get(evidence_id)
    if not e:
        return jsonify({"error":"NotFound","message":"Evidence not found"}), 404
    e.status = status
    if comment is not None:
        e.review_comment = str(comment)
    # optionally auto-verify mentor on first approval
    if status == 'approved':
        u = User.query.get(e.mentor_id)
        if u and not u.verified:
            u.verified = True
    db.session.commit()
    return jsonify({"message":"updated","status": e.status})
