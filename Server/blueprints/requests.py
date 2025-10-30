from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import desc
from datetime import datetime
from extensions import db
from models import MentorshipRequest, User, Session

requests_bp = Blueprint('requests', __name__)


@requests_bp.post('/')
@jwt_required()
def create_request():
    claims = get_jwt() or {}
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    if claims.get('role') != 'learner':
        return jsonify({"error":"Forbidden","message":"Learner only"}), 403
    data = request.get_json() or {}
    mentor_id = data.get('mentor_id')
    topic = (data.get('topic') or '').strip()
    message = (data.get('message') or '').strip()
    # optional booking fields
    preferred_time = data.get('preferred_time')  # ISO string expected
    duration_minutes = data.get('duration_minutes')
    if not mentor_id or not topic:
        return jsonify({"error":"ValidationError","message":"mentor_id and topic required"}), 400
    mentor = User.query.filter_by(id=mentor_id, role='mentor').first()
    if not mentor:
        return jsonify({"error":"NotFound","message":"Mentor not found"}), 404
    if not getattr(mentor, 'verified', False):
        return jsonify({"error":"Forbidden","message":"Mentor not verified yet"}), 403
    # parse preferred_time if provided
    dt = None
    if isinstance(preferred_time, str):
        try:
            dt = datetime.fromisoformat(preferred_time.replace('Z','+00:00'))
        except Exception:
            dt = None
    dur = None
    try:
        if duration_minutes is not None:
            dur = int(duration_minutes)
    except Exception:
        dur = None
    req = MentorshipRequest(
        learner_id=uid,
        mentor_id=mentor_id,
        topic=topic,
        message=message,
        preferred_time=dt,
        duration_minutes=dur,
    )
    db.session.add(req)
    # If learner provided a preferred time, auto-create a tentative session (proposed)
    created_session = None
    if dt is not None:
        s = Session(
            mentor_id=mentor_id,
            learner_id=uid,
            request_id=None,  # link after commit when we have req.id
            start_time=dt,
            duration_minutes=dur or 60,
            status='proposed',
        )
        db.session.add(s)
        created_session = s
    db.session.commit()
    if created_session:
        # link session to request now that ids exist
        created_session.request_id = req.id
        db.session.commit()
    return jsonify({
        "id": req.id,
        "status": req.status,
        "preferred_time": req.preferred_time.isoformat() if req.preferred_time else None,
        "duration_minutes": req.duration_minutes,
        "session": ({
            "id": created_session.id,
            "start_time": created_session.start_time.isoformat(),
            "duration_minutes": created_session.duration_minutes,
            "status": created_session.status,
        } if created_session else None),
    }), 201


@requests_bp.get('/mine')
@jwt_required()
def list_mine():
    claims = get_jwt() or {}
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    if claims.get('role') != 'learner':
        return jsonify({"error":"Forbidden"}), 403
    items = MentorshipRequest.query.filter_by(learner_id=uid).order_by(desc(MentorshipRequest.created_at)).all()
    return jsonify([{ 'id':r.id, 'mentor_id': r.mentor_id, 'topic': r.topic, 'status': r.status, 'created_at': r.created_at.isoformat(), 'preferred_time': r.preferred_time.isoformat() if r.preferred_time else None, 'duration_minutes': r.duration_minutes } for r in items])


@requests_bp.get('/incoming')
@jwt_required()
def incoming():
    claims = get_jwt() or {}
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    if claims.get('role') != 'mentor':
        return jsonify({"error":"Forbidden"}), 403
    # ensure mentor is verified
    me = User.query.get(uid)
    if not me or not getattr(me, 'verified', False):
        return jsonify({"error":"Forbidden","message":"Mentor not verified"}), 403
    items = MentorshipRequest.query.filter_by(mentor_id=uid).order_by(desc(MentorshipRequest.created_at)).all()
    return jsonify([{ 'id':r.id, 'learner_id': r.learner_id, 'topic': r.topic, 'status': r.status, 'created_at': r.created_at.isoformat(), 'preferred_time': r.preferred_time.isoformat() if r.preferred_time else None, 'duration_minutes': r.duration_minutes } for r in items])


@requests_bp.patch('/<int:req_id>/accept')
@jwt_required()
def accept(req_id: int):
    claims = get_jwt() or {}
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    if claims.get('role') != 'mentor':
        return jsonify({"error":"Forbidden"}), 403
    # ensure mentor is verified
    me = User.query.get(uid)
    if not me or not getattr(me, 'verified', False):
        return jsonify({"error":"Forbidden","message":"Mentor not verified"}), 403
    r = MentorshipRequest.query.filter_by(id=req_id, mentor_id=uid).first()
    if not r:
        return jsonify({"error":"NotFound"}), 404
    r.status = 'accepted'
    db.session.commit()
    return jsonify({"message":"accepted"})


@requests_bp.patch('/<int:req_id>/decline')
@jwt_required()
def decline(req_id: int):
    claims = get_jwt() or {}
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    if claims.get('role') != 'mentor':
        return jsonify({"error":"Forbidden"}), 403
    me = User.query.get(uid)
    if not me or not getattr(me, 'verified', False):
        return jsonify({"error":"Forbidden","message":"Mentor not verified"}), 403
    r = MentorshipRequest.query.filter_by(id=req_id, mentor_id=uid).first()
    if not r:
        return jsonify({"error":"NotFound"}), 404
    r.status = 'declined'
    db.session.commit()
    return jsonify({"message":"declined"})


@requests_bp.patch('/<int:req_id>/cancel')
@jwt_required()
def cancel(req_id: int):
    claims = get_jwt() or {}
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    if claims.get('role') != 'learner':
        return jsonify({"error":"Forbidden"}), 403
    r = MentorshipRequest.query.filter_by(id=req_id, learner_id=uid).first()
    if not r:
        return jsonify({"error":"NotFound"}), 404
    r.status = 'cancelled'
    db.session.commit()
    return jsonify({"message":"cancelled"})
