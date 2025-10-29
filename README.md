 # 🧩 SkillLink — Learn. Connect. Grow.

SkillLink bridges the gap between **learners** and **mentors** through a streamlined mentorship platform.  
Users can sign up, connect by skills, exchange mentorship requests, upload skill evidence, and get verified by admins.

---

## 🚀 Features

✅ User registration & login (Learner / Mentor / Admin)  
✅ Mentor verification by admin  
✅ Learner–mentor request system  
✅ Upload and manage skill evidence (certificates, links)  
✅ Admin panel for reviewing requests & verifying mentors  
✅ Responsive React UI with Flask REST API backend  

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React + Vite + TailwindCSS |
| **Backend** | Flask (Python) + SQLAlchemy ORM + Flask-Migrate |
| **Database** | SQLite (default) / PostgreSQL (optional) |
| **Testing** | Postman, Flask test client |
| **Version Control** | Git + GitHub |

---

## ⚙️ Setup Instructions

### 🔹 1. Prerequisites
- Node.js ≥ 18  
- Python ≥ 3.12  
- (Optional) PostgreSQL ≥ 14  

---

### 🔹 2. Backend (Flask API)

```bash
cd Server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt





Set up environment:

export FLASK_APP=app:create_app
export FLASK_ENV=development
export JWT_SECRET_KEY=dev-secret


Run migrations (if any):

flask db upgrade
python seed.py
flask run --port 5000


✅ Check: http://127.0.0.1:5000/health
 → { "status": "ok" }

🔹 3. Frontend (React + Vite)
cd Client
npm install
echo "VITE_API_URL=http://127.0.0.1:5000" > .env
npm run dev


Default dev URL → http://localhost:5173

👤 Seeded Test Accounts
Role	Email	Password
Admin	admin@skilllink.com	admin123
Mentor (verified)	mentor2@example.com	password
Mentor (unverified)	mentor1@example.com	password
Learner	learner1@example.com	password
🔁 Common API Workflows
Action	Endpoint
Login	POST /auth/login
Send Mentorship Request	POST /requests/
Accept/Decline Request (Mentor)	PATCH /requests/:id
Upload Evidence	POST /evidence/upload
Admin Verifies Mentor	PATCH /admin/mentors/:id