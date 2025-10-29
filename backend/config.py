import os
from urllib.parse import urlparse


def normalize_database_url(raw: str) -> str:
	if raw.startswith("postgres://"):
		return raw.replace("postgres://", "postgresql://", 1)
	return raw


class BaseConfig:
	SQLALCHEMY_DATABASE_URI = normalize_database_url(os.getenv("DATABASE_URL", "sqlite:///skilllink.db"))
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
	CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173")
	DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

	# Optional: enable SQLAlchemy engine options for production Postgres
	SQLALCHEMY_ENGINE_OPTIONS = {
		"pool_pre_ping": True,
		"pool_recycle": 300,
	}


class DevelopmentConfig(BaseConfig):
	DEBUG = True


class ProductionConfig(BaseConfig):
	DEBUG = False


def get_config(name: str | None):
	if (name or os.getenv("FLASK_ENV")) == "production":
		return ProductionConfig
	return DevelopmentConfig
