from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models import User

auth_bp = Blueprint('auth', _name_)


@auth_bp.post('/forgot')
def forgot_password():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    email = (data.get('email') or '').strip().lower()
    if not email:
        return jsonify({"error":"BadRequest","message":"email is required"}), 400
    # In a real implementation, generate a reset token and email it.
    # Here we just return a mock token for development.
    return jsonify({"message":"reset link sent (mock)", "reset_token":"mock-token"})


@auth_bp.post('/reset')
def reset_password():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    token = (data.get('token') or '').strip()
    new_password = data.get('password') or ''
    email = (data.get('email') or '').strip().lower()
    if not token or not new_password or not email:
        return jsonify({"error":"BadRequest","message":"token, email and password are required"}), 400
    # Mock token acceptance. Find the user by email and set a new password.
    u = User.query.filter_by(email=email).first()
    if not u:
        return jsonify({"error":"NotFound","message":"user not found"}), 404
    u.set_password(new_password)
    db.session.commit()
    return jsonify({"message":"password reset successful"})


@auth_bp.post('/register')
def register():
    data = request.get_json(silent=True)
    if not data:
        data = request.form.to_dict() if request.form else {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    role = (data.get('role') or 'learner').strip().lower()
    if not name or not email or not password:
        return jsonify({"error":"ValidationError","message":"name, email, password required"}), 400
    if role not in ('learner','mentor','admin'):
        return jsonify({"error":"ValidationError","message":"invalid role"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error":"Conflict","message":"email already exists"}), 409
    u = User(name=name, email=email, role=role)
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    return jsonify({"id":u.id, "name":u.name, "email":u.email, "role":u.role}), 201


@auth_bp.post('/login')
def login():
    data = request.get_json(silent=True)
    if not data:
        data = request.form.to_dict() if request.form else {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    u = User.query.filter_by(email=email).first()
    if not u or not u.check_password(password):
        return jsonify({"error":"Unauthorized","message":"invalid credentials"}), 401
    # identity (sub) must be a string; put other fields into additional claims
    token = create_access_token(identity=str(u.id), additional_claims={"email": u.email, "role": u.role})
    return jsonify({
        "access_token": token,
        "user": {"id": u.id, "email": u.email, "role": u.role}
    })


@auth_bp.get('/me')
@jwt_required()
def me():
    claims = get_jwt()
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    return jsonify({"id": uid, "email": claims.get("email"), "role": claims.get("role")})