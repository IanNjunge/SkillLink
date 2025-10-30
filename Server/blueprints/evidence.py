import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
from extensions import db
from models import Evidence
from models import User

ALLOWED_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.pdf'}

evidence_bp = Blueprint('evidence', __name__)


def ensure_upload_dir():
    up = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(up, exist_ok=True)
    return up


@evidence_bp.get('/')
@jwt_required()
def list_mine():
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    items = Evidence.query.filter_by(mentor_id=uid).order_by(Evidence.created_at.desc()).all()
    return jsonify([
        {
            'id': e.id,
            'name': e.name,
            'url': e.url,
            'type': e.type,
            'description': e.description,
            'status': e.status,
            'review_comment': e.review_comment,
            'created_at': e.created_at.isoformat()
        } for e in items
    ])


@evidence_bp.post('/upload')
@jwt_required()
def upload():
    claims = get_jwt() or {}
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    if claims.get('role') != 'mentor':
        return jsonify({"error":"Forbidden","message":"Mentors only"}), 403
    # block uploads for already verified mentors
    me = User.query.get(uid)
    if me is not None and getattr(me, 'verified', False):
        return jsonify({"error":"Forbidden","message":"Already verified; no evidence required"}), 403
    if 'file' not in request.files:
        return jsonify({"error":"ValidationError","message":"Missing file"}), 400
    f = request.files['file']
    if not f or f.filename == '':
        return jsonify({"error":"ValidationError","message":"Empty file"}), 400
    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in ALLOWED_EXTS:
        return jsonify({"error":"ValidationError","message":"Unsupported file type"}), 400
    updir = ensure_upload_dir()
    filename = secure_filename(f.filename)
    path = os.path.join(updir, filename)
    f.save(path)

    desc = request.form.get('description') if request.form else None
    e = Evidence(
        mentor_id=uid,
        type='pdf' if ext=='.pdf' else 'image',
        url=f"/uploads/{filename}",
        name=filename,
        description=desc or None,
        status='pending'
    )
    db.session.add(e)
    db.session.commit()
    return jsonify({ 'id': e.id, 'name': e.name, 'url': e.url, 'type': e.type, 'status': e.status }), 201


@evidence_bp.post('/link')
@jwt_required()
def add_link():
    claims = get_jwt() or {}
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    if claims.get('role') != 'mentor':
        return jsonify({"error":"Forbidden","message":"Mentors only"}), 403
    me = User.query.get(uid)
    if me is not None and getattr(me, 'verified', False):
        return jsonify({"error":"Forbidden","message":"Already verified; no evidence required"}), 403
    data = request.get_json(silent=True) or {}
    url = (data.get('url') or '').strip()
    name = (data.get('name') or '').strip() or 'Link'
    kind = (data.get('kind') or 'link').strip().lower()
    description = (data.get('description') or '').strip() or None
    if not url or not (url.startswith('http://') or url.startswith('https://')):
        return jsonify({"error":"ValidationError","message":"Valid url is required"}), 400
    if kind not in {'github','linkedin','demo','link'}:
        kind = 'link'
    e = Evidence(
        mentor_id=uid,
        type='link',
        url=url,
        name=name or kind.title(),
        description=description,
        status='pending'
    )
    db.session.add(e)
    db.session.commit()
    return jsonify({ 'id': e.id, 'name': e.name, 'url': e.url, 'type': e.type, 'status': e.status, 'description': e.description }), 201

@evidence_bp.post('/submit')
@jwt_required()
def submit_for_review():
    claims = get_jwt() or {}
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    if claims.get('role') != 'mentor':
        return jsonify({"error":"Forbidden","message":"Mentors only"}), 403
    me = User.query.get(uid)
    if me is not None and getattr(me, 'verified', False):
        return jsonify({"error":"Forbidden","message":"Already verified; no evidence required"}), 403
    # Uploads are already created with status='pending'. This endpoint exists for UX to confirm submission.
    total = Evidence.query.filter_by(mentor_id=uid).count()
    pending = Evidence.query.filter_by(mentor_id=uid, status='pending').count()
    return jsonify({"message":"submitted","pending": pending, "total": total})

@evidence_bp.delete('/<int:evidence_id>')
@jwt_required()
def delete_item(evidence_id: int):
    ident = get_jwt_identity()
    try:
        uid = int(ident)
    except Exception:
        uid = ident
    e = Evidence.query.get(evidence_id)
    if not e or e.mentor_id != uid:
        return jsonify({"error":"NotFound","message":"Evidence not found"}), 404
    try:
        updir = ensure_upload_dir()
        fp = os.path.join(updir, os.path.basename(e.url))
        if os.path.exists(fp):
            os.remove(fp)
    except Exception:
        pass
    db.session.delete(e)
    db.session.commit()
    return jsonify({"message":"deleted"})
