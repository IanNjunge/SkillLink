from flask import Blueprint, jsonify

links_bp = Blueprint("links", __name__)

@links_bp.route("/links")
def get_links():
    return jsonify({"message": "Links route is working!"})
