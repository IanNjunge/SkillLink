from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models import User, Skill, UserSkill

users_bp = Blueprint('users', __name__)


@users_bp.get('/me')
@jwt_required()
def get_me():
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    u = User.query.get(uid)
    if not u:
        return jsonify({"error":"NotFound"}), 404
    return jsonify({
        'id': u.id,
        'name': u.name,
        'email': u.email,
        'role': u.role,
        'verified': u.verified
    })


@users_bp.patch('/me')
@jwt_required()
def update_me():
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    u = User.query.get(uid)
    if not u:
        return jsonify({"error":"NotFound"}), 404
    data = request.get_json() or {}
    name = data.get('name')
    if name:
        u.name = name.strip()
    db.session.commit()
    return jsonify({ 'message': 'updated' })


@users_bp.get('/me/skills')
@jwt_required()
def list_my_skills():
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    rows = UserSkill.query.filter_by(user_id=uid).all()
    return jsonify([{'id': r.id, 'name': r.skill.name} for r in rows])


@users_bp.post('/me/skills')
@jwt_required()
def add_skill():
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({"error":"ValidationError","message":"name required"}), 400
    sk = Skill.query.filter(Skill.name.ilike(name)).first()
    if not sk:
        sk = Skill(name=name)
        db.session.add(sk)
        db.session.flush()
    exists = UserSkill.query.filter_by(user_id=uid, skill_id=sk.id).first()
    if exists:
        return jsonify({"error":"Conflict","message":"already added"}), 409
    us = UserSkill(user_id=uid, skill_id=sk.id)
    db.session.add(us)
    db.session.commit()
    return jsonify({'id': us.id, 'name': sk.name}), 201


@users_bp.delete('/me/skills/<string:name>')
@jwt_required()
def remove_skill(name: str):
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    sk = Skill.query.filter(Skill.name.ilike(name)).first()
    if not sk:
        return jsonify({"error":"NotFound"}), 404
    us = UserSkill.query.filter_by(user_id=uid, skill_id=sk.id).first()
    if not us:
        return jsonify({"error":"NotFound"}), 404
    db.session.delete(us)
    db.session.commit()
    return jsonify({"message":"deleted"})