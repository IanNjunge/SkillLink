from flask import Flask, jsonify
from dotenv import load_dotenv
from extensions import db, migrate, jwt, cors, swagger
from config import get_config
from blueprints.auth import auth_bp
from blueprints.users import users_bp
from blueprints.mentors import mentors_bp
from blueprints.requests import requests_bp
from blueprints.reviews import reviews_bp
from blueprints.admin import admin_bp
from blueprints.evidence import evidence_bp


def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(get_config())

    # init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    allowed_origins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'https://skilllink-wilson-phase5.netlify.app',
    ]
    cors(app, resources={
        r"/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Authorization", "Content-Type"],
            "expose_headers": ["Authorization"],
        }
    })

    swagger(app, template={
        'swagger': '2.0',
        'info': {
            'title': 'SkillLink API',
            'version': '1.0.0',
            'description': 'API for SkillLink platform',
        },
        'basePath': '/',
        'schemes': ['http'],
        'securityDefinitions': {
            'Bearer': {
                'type': 'apiKey',
                'name': 'Authorization',
                'in': 'header',
                'description': 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
            }
        }
    })

    # blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(mentors_bp, url_prefix='/mentors')
    app.register_blueprint(requests_bp, url_prefix='/requests')
    app.register_blueprint(reviews_bp, url_prefix='/reviews')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(evidence_bp, url_prefix='/evidence')

    @app.get('/health')
    def health():
        return jsonify(status='ok')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)