import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///skilllink.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-secret')
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173')
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')


def get_config():
    return Config()
