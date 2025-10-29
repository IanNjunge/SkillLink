from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate
from .config import get_config
from .routes.links import links_bp
from .routes.users import users_bp


def create_app(config_name: str | None = None) -> Flask:
	app = Flask(__name__)
	app.config.from_object(get_config(config_name))

	# Extensions
	db.init_app(app)
	migrate.init_app(app, db)
	origins = app.config.get("CORS_ORIGINS", "http://localhost:5173")
	if isinstance(origins, str):
		origins = [o.strip() for o in origins.split(",") if o.strip()]
	CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=False)

	# Blueprints
	app.register_blueprint(links_bp, url_prefix="/api/links")
	app.register_blueprint(users_bp, url_prefix="/api/users")

	@app.get("/api/health")
	def health():
		return {"status": "ok"}

	return app


if __name__ == "__main__":
	app = create_app()
	app.run(host="0.0.0.0", port=5000, debug=app.config.get("DEBUG", False))
