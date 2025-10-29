from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Link, User
from ..utils.opengraph import fetch_page_title


links_bp = Blueprint("links", __name__)


def get_user(user_id: int) -> User | None:
	return User.query.get(user_id)


def link_to_dict(link: Link):
	return link.to_dict()


@links_bp.get("")
def list_links():
	user_id = request.args.get("user_id", type=int)
	query = Link.query
	if user_id:
		query = query.filter_by(user_id=user_id)
	links = query.order_by(Link.created_at.desc()).all()
	return jsonify([link_to_dict(l) for l in links])


@links_bp.post("")
def create_link():
	data = request.get_json() or {}
	url = (data.get("url") or "").strip()
	user_id = data.get("user_id")
	title = (data.get("title") or "").strip() or None
	notes = (data.get("notes") or "").strip() or None
	if not url:
		return jsonify({"error": "url is required"}), 400
	if not isinstance(user_id, int):
		return jsonify({"error": "user_id is required and must be int"}), 400
	user = get_user(user_id)
	if not user:
		return jsonify({"error": "user not found"}), 404
	if not title:
		title = fetch_page_title(url)
	link = Link(url=url, user_id=user.id, title=title, notes=notes)
	db.session.add(link)
	db.session.commit()
	return jsonify(link_to_dict(link)), 201


@links_bp.get("/<int:link_id>")
def get_link(link_id: int):
	link = Link.query.get_or_404(link_id)
	return jsonify(link_to_dict(link))


@links_bp.patch("/<int:link_id>")
@links_bp.put("/<int:link_id>")
def update_link(link_id: int):
	link = Link.query.get_or_404(link_id)
	data = request.get_json() or {}
	if "url" in data:
		url = (data.get("url") or "").strip()
		if not url:
			return jsonify({"error": "url cannot be empty"}), 400
		link.url = url
	if "title" in data:
		val = (data.get("title") or "").strip() or None
		link.title = val
	if "notes" in data:
		link.notes = (data.get("notes") or "").strip() or None
	db.session.commit()
	return jsonify(link_to_dict(link))


@links_bp.delete("/<int:link_id>")
def delete_link(link_id: int):
	link = Link.query.get_or_404(link_id)
	db.session.delete(link)
	db.session.commit()
	return ("", 204)
