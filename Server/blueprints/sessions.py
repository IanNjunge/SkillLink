from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from sqlalchemy import desc
from datetime import datetime
from extensions import db
from models import Session, MentorshipRequest, User

sessions_bp = Blueprint('sessions', __name__)


def _uid():
    ident = get_jwt_identity()
    try:
        return int(ident)
    except Exception:
        return ident


@sessions_bp.post('/')
@jwt_required()
def create_session():
    claims = get_jwt() or {}
    uid = _uid()
    data = request.get_json() or {}
    request_id = data.get('request_id')
    start_time = data.get('start_time')
    duration_minutes = data.get('duration_minutes') or 60
    # Only mentor can schedule from an accepted request
    if claims.get('role') != 'mentor':
        return jsonify({"error": "Forbidden"}), 403
    req = MentorshipRequest.query.filter_by(id=request_id).first()
    if not req:
        return jsonify({"error":"NotFound","message":"Request not found"}), 404
    if req.mentor_id != uid:
        return jsonify({"error":"Forbidden"}), 403
    if req.status != 'accepted':
        return jsonify({"error":"InvalidState","message":"Request must be accepted to schedule"}), 400
    # parse datetime
    dt = None
    if isinstance(start_time, str):
        try:
            dt = datetime.fromisoformat(start_time.replace('Z','+00:00'))
        except Exception:
            pass
    if not dt:
        return jsonify({"error":"ValidationError","message":"Invalid start_time"}), 400
    try:
        dur = int(duration_minutes)
    except Exception:
        dur = 60
    s = Session(
        mentor_id=req.mentor_id,
        learner_id=req.learner_id,
        request_id=req.id,
        start_time=dt,
        duration_minutes=dur,
        status='scheduled',
    )
    db.session.add(s)
    db.session.commit()
    return jsonify({
        'id': s.id,
        'mentor_id': s.mentor_id,
        'learner_id': s.learner_id,
        'start_time': s.start_time.isoformat(),
        'duration_minutes': s.duration_minutes,
        'status': s.status,
    }), 201


@sessions_bp.get('/mine')
@jwt_required()
def my_sessions():
    claims = get_jwt() or {}
    uid = _uid()
    role = claims.get('role')
    if role == 'learner':
        items = Session.query.filter_by(learner_id=uid).order_by(desc(Session.start_time)).all()
    elif role == 'mentor':
        items = Session.query.filter_by(mentor_id=uid).order_by(desc(Session.start_time)).all()
    else:
        return jsonify([])
    return jsonify([
        {
            'id': s.id,
            'mentor_id': s.mentor_id,
            'learner_id': s.learner_id,
            'request_id': s.request_id,
            'start_time': s.start_time.isoformat(),
            'duration_minutes': s.duration_minutes,
            'status': s.status,
        } for s in items
    ])


@sessions_bp.patch('/<int:sid>/cancel')
@jwt_required()
def cancel_session(sid: int):
    claims = get_jwt() or {}
    uid = _uid()
    s = Session.query.get(sid)
    if not s:
        return jsonify({"error":"NotFound"}), 404
    if uid not in {s.mentor_id, s.learner_id}:
        return jsonify({"error":"Forbidden"}), 403
    s.status = 'cancelled'
    db.session.commit()
    return jsonify({"message":"cancelled"})


@sessions_bp.patch('/<int:sid>/complete')
@jwt_required()
def complete_session(sid: int):
    claims = get_jwt() or {}
    uid = _uid()
    if claims.get('role') != 'mentor':
        return jsonify({"error":"Forbidden"}), 403
    s = Session.query.get(sid)
    if not s:
        return jsonify({"error":"NotFound"}), 404
    if s.mentor_id != uid:
        return jsonify({"error":"Forbidden"}), 403
    s.status = 'completed'
    db.session.commit()
    return jsonify({"message":"completed"})
