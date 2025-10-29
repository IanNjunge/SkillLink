import os
import sys
import argparse
from .app import create_app
from .extensions import db
from flask_migrate import Migrate, init as mig_init, migrate as mig_migrate, upgrade as mig_upgrade, downgrade as mig_downgrade, stamp as mig_stamp


app = create_app()
migrate = Migrate(app, db)


def ensure_initialized(migrations_dir: str = "migrations"):
	if not os.path.isdir(migrations_dir):
		mig_init(directory=migrations_dir)
		# stamp current schema as base
		mig_stamp(directory=migrations_dir, revision="head")


def cmd_init(args):
	ensure_initialized(args.directory)
	print("Migrations initialized.")


def cmd_migrate(args):
	ensure_initialized(args.directory)
	message = args.message or "auto"
	mig_migrate(directory=args.directory, message=message)
	print("Migration generated.")


def cmd_upgrade(args):
	ensure_initialized(args.directory)
	mig_upgrade(directory=args.directory, revision=args.revision)
	print("Database upgraded.")


def cmd_downgrade(args):
	ensure_initialized(args.directory)
	mig_downgrade(directory=args.directory, revision=args.revision)
	print("Database downgraded.")


def main():
	parser = argparse.ArgumentParser(description="SkillLink DB management")
	sub = parser.add_subparsers(dest="command", required=True)

	p_init = sub.add_parser("init-db")
	p_init.add_argument("--directory", default="migrations")
	p_init.set_defaults(func=cmd_init)

	p_migrate = sub.add_parser("migrate")
	p_migrate.add_argument("--directory", default="migrations")
	p_migrate.add_argument("--message", "-m", default="auto")
	p_migrate.set_defaults(func=cmd_migrate)

	p_up = sub.add_parser("upgrade")
	p_up.add_argument("--directory", default="migrations")
	p_up.add_argument("--revision", default="head")
	p_up.set_defaults(func=cmd_upgrade)

	p_down = sub.add_parser("downgrade")
	p_down.add_argument("--directory", default="migrations")
	p_down.add_argument("--revision", default="-1")
	p_down.set_defaults(func=cmd_downgrade)

	args = parser.parse_args()
	with app.app_context():
		args.func(args)


if __name__ == "__main__":
	sys.exit(main())
