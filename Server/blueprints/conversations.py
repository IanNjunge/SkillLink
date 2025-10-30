from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, desc, func
from extensions import db
from models import User, Conversation, Message

conversations_bp = Blueprint('conversations', __name__)


def _get_current_user():
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    u = User.query.get(uid)
    return u


def _conv_to_dict(c: Conversation, current_user_id: int):
    last_msg = (
        Message.query.filter_by(conversation_id=c.id)
        .order_by(desc(Message.created_at))
        .first()
    )
    unread_count = (
        db.session.query(func.count(Message.id))
        .filter(
            Message.conversation_id == c.id,
            Message.sender_id != current_user_id,
            Message.read_at.is_(None),
        )
        .scalar()
    )
    other = c.learner if c.mentor_id == current_user_id else c.mentor
    return {
        'id': c.id,
        'mentor': {'id': c.mentor.id, 'name': c.mentor.name},
        'learner': {'id': c.learner.id, 'name': c.learner.name},
        'other': {'id': other.id, 'name': other.name},
        'last_message': {
            'id': last_msg.id,
            'text': last_msg.text,
            'sender_id': last_msg.sender_id,
            'created_at': last_msg.created_at.isoformat(),
        } if last_msg else None,
        'unread': int(unread_count or 0),
        'created_at': c.created_at.isoformat(),
        'updated_at': c.updated_at.isoformat() if c.updated_at else None,
    }


@conversations_bp.get('')
@conversations_bp.get('/')
@jwt_required()
def list_conversations():
    me = _get_current_user()
    if not me:
        return jsonify({'error': 'Unauthorized'}), 401
    convs = Conversation.query.filter(
        or_(Conversation.mentor_id == me.id, Conversation.learner_id == me.id)
    ).order_by(desc(Conversation.updated_at), desc(Conversation.created_at)).all()
    return jsonify([_conv_to_dict(c, me.id) for c in convs])


@conversations_bp.post('')
@conversations_bp.post('/')
@jwt_required()
def create_or_get_conversation():
    me = _get_current_user()
    if not me:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json(silent=True) or {}
    mentor_id = data.get('mentor_id')
    learner_id = data.get('learner_id')

    # Determine pair based on current role and provided id
    if me.role == 'learner':
        if not mentor_id:
            return jsonify({'error': 'ValidationError', 'message': 'mentor_id required'}), 400
        mentor = User.query.get(mentor_id)
        if not mentor or mentor.role != 'mentor':
            return jsonify({'error': 'ValidationError', 'message': 'invalid mentor_id'}), 400
        pair = (mentor.id, me.id)
    elif me.role == 'mentor':
        if not learner_id:
            return jsonify({'error': 'ValidationError', 'message': 'learner_id required'}), 400
        learner = User.query.get(learner_id)
        if not learner or learner.role != 'learner':
            return jsonify({'error': 'ValidationError', 'message': 'invalid learner_id'}), 400
        pair = (me.id, learner.id)
    else:
        return jsonify({'error': 'Forbidden'}), 403

    mentor_id, learner_id = pair
    conv = Conversation.query.filter_by(mentor_id=mentor_id, learner_id=learner_id).first()
    if not conv:
        conv = Conversation(mentor_id=mentor_id, learner_id=learner_id)
        db.session.add(conv)
        db.session.commit()
    return jsonify(_conv_to_dict(conv, me.id)), 201


def _ensure_participant(conv: Conversation, user_id: int) -> bool:
    return conv and (conv.mentor_id == user_id or conv.learner_id == user_id)


@conversations_bp.get('/<int:cid>/messages')
@jwt_required()
def list_messages(cid: int):
    me = _get_current_user()
    if not me:
        return jsonify({'error': 'Unauthorized'}), 401
    conv = Conversation.query.get(cid)
    if not conv or not _ensure_participant(conv, me.id):
        return jsonify({'error': 'NotFound'}), 404
    msgs = Message.query.filter_by(conversation_id=conv.id).order_by(Message.created_at.asc()).all()
    # mark others' messages as read
    for m in msgs:
        if m.sender_id != me.id and not m.read_at:
            m.read_at = func.now()
    db.session.commit()
    return jsonify([
        {
            'id': m.id,
            'text': m.text,
            'sender_id': m.sender_id,
            'created_at': m.created_at.isoformat(),
            'read_at': m.read_at.isoformat() if m.read_at else None,
        } for m in msgs
    ])


@conversations_bp.post('/<int:cid>/messages')
@jwt_required()
def send_message(cid: int):
    me = _get_current_user()
    if not me:
        return jsonify({'error': 'Unauthorized'}), 401
    conv = Conversation.query.get(cid)
    if not conv or not _ensure_participant(conv, me.id):
        return jsonify({'error': 'NotFound'}), 404
    data = request.get_json(silent=True) or {}
    text = (data.get('text') or '').strip()
    if not text:
        return jsonify({'error': 'ValidationError', 'message': 'text required'}), 400
    msg = Message(conversation_id=conv.id, sender_id=me.id, text=text)
    db.session.add(msg)
    # bump conversation updated time
    conv.updated_at = func.now()
    db.session.commit()
    return jsonify({
        'id': msg.id,
        'text': msg.text,
        'sender_id': msg.sender_id,
        'created_at': msg.created_at.isoformat(),
    }), 201
