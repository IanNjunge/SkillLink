# SkillLink

## What it is
SkillLink connects learners and mentors for skill-based mentorship. Users can register, list skills, send/receive mentorship requests, upload evidence (certificates/links), and admins verify mentors.

## Tech Stack
- **Frontend**: React + Vite (`Client/`)
- **Backend**: Flask REST API (`Server/`), SQLAlchemy ORM, Flask-Migrate
- **DB**: SQLite for local dev (default). Optional PostgreSQL.

---

## Prerequisites
- Node.js 18+
- Python 3.12+

Optional for Postgres:
- PostgreSQL 14+

---

## Backend (Flask) – Setup & Run

1) Create and activate a virtualenv (if not present):
```bash
cd Server
python3 -m venv venv
./venv/bin/pip install -U pip wheel
```

2) Configure environment (development defaults) and run migrations if any:
```bash
export FLASK_APP=app:create_app
export FLASK_ENV=development
export JWT_SECRET_KEY=dev-secret
# If you switch to Postgres, also set SQLALCHEMY_DATABASE_URI
# export SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://user:pass@localhost:5432/skilllink

# If migrations exist
./venv/bin/flask db upgrade || true
```

3) Install backend deps (if needed), seed DB, and start API:
```bash
./venv/bin/pip install -r requirements.txt || true
./venv/bin/python seed.py
./venv/bin/flask run --port 5000
```
Health check: http://127.0.0.1:5000/health → `{ "status": "ok" }`

---

## Frontend (Vite) – Setup & Run

1) Install dependencies and set API base URL:
```bash
cd Client
npm install
# Create .env if needed
# echo "VITE_API_URL=http://127.0.0.1:5000" > .env
```

2) Start the dev server:
```bash
npm run dev
```
Default dev URL: http://localhost:5173 (or 5174). CORS is enabled for 5173/5174 in the API.

---

## Seeded Accounts (for testing)
- **Admin**: `admin@skilllink.com` / `admin123`
- **Mentor (verified)**: `mentor2@example.com` / `password`
- **Mentor (unverified)**: `mentor1@example.com` / `password`
- **Learner**: `learner1@example.com` / `password`

---

## Common Workflows
- **Login**: UI `Client/src/pages/Login.jsx` → `POST /auth/login`
- **Learner requests mentorship**: `POST /requests/` (mentor must be verified)
- **Mentor manages requests**: `GET /requests/incoming`, `PATCH /requests/:id/accept|decline`
- **Evidence (mentor)**: `GET /evidence/`, `POST /evidence/upload`, `POST /evidence/link`, `POST /evidence/submit`, `DELETE /evidence/:id`
- **Admin verification**: `GET /admin/evidence?status=pending`, `PATCH /admin/evidence/:id`; mentor verification under `/admin/mentors`

---

## Switch to PostgreSQL (optional)
1) Set the DB URI and run migrations:
```bash
cd Server
export SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://USER:PASS@HOST:5432/DB
./venv/bin/flask db upgrade
./venv/bin/python seed.py  # optional reseed
./venv/bin/flask run --port 5000
```

2) Update frontend API base if needed in `Client/.env`, then restart Vite.

---

## Troubleshooting
- **CORS errors**: Ensure API is on 5000 and CORS in `Server/app.py` includes your dev port (5173/5174). Avoid redirecting preflight; use `/requests/` with trailing slash.
- **Invalid email or password**: Rerun `Server/seed.py` and confirm `POST /auth/login` is 200 in DevTools Network.
- **Mentor requests blocked**: Only verified mentors accept requests; verify via Admin Dashboard.
