# FinRisk — ML-Powered Credit Risk Assessment Platform

> A full-stack web application that evaluates loan applicants' credit risk in real time using a machine learning model, rule-based decision engine, and a role-based admin dashboard.

![Tech Stack](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E?style=flat&logo=scikit-learn)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat&logo=postgresql)
![Deployed](https://img.shields.io/badge/Frontend-Cloudflare%20Pages-F38020?style=flat&logo=cloudflare)

---

## Features

- **Instant ML credit assessment** — Logistic Regression model (calibrated via Platt scaling) predicts default probability from 7 financial features
- **Rule-based decision engine** — Approve / Review / Reject decisions overlaid with hard rules (DTI > 60%, prior defaults)
- **Live DTI preview** — Debt-to-income ratio updates in real time as the user types
- **Role-based access control** — JWT-secured endpoints with `user` and `admin` roles
- **Admin dashboard** — View all applications, filter by risk/decision, and manually override decisions
- **Application history** — Users can view all their past assessments with full result breakdowns
- **Persistent storage** — All applications persisted to a serverless PostgreSQL database (Neon)
- **Explainable results** — Each decision includes a list of contributing risk factors

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| API Framework | FastAPI 0.136 |
| ML Model | scikit-learn 1.8 — Logistic Regression + CalibratedClassifierCV |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL via Neon (serverless) |
| Auth | JWT (python-jose) + bcrypt password hashing |
| Server | Uvicorn |
| Validation | Pydantic v2 |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Bundler | Vite 8 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Hosting | Cloudflare Pages |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     React Frontend                        │
│  Login / Signup  →  Apply  →  My Applications  →  Admin  │
└────────────────────────┬─────────────────────────────────┘
                         │  REST (JWT Bearer)
┌────────────────────────▼─────────────────────────────────┐
│                    FastAPI Backend                         │
│                                                           │
│  /auth/signup   /auth/login                               │
│  /predict       /my-applications                          │
│  /applications  /applications/{id}/override               │
│                                                           │
│  ┌─────────────────┐   ┌──────────────────────────────┐  │
│  │   ML Model      │   │    Decision Engine            │  │
│  │ LogisticReg +   │   │  DTI check + rule overrides   │  │
│  │ Platt Scaling   │   │  → Low/Medium/High risk       │  │
│  └─────────────────┘   └──────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │  SQLAlchemy ORM (SSL)
┌────────────────────────▼─────────────────────────────────┐
│              Neon PostgreSQL (serverless)                  │
│               users  ·  applications                      │
└──────────────────────────────────────────────────────────┘
```

---

## ML Model

The model is trained on synthetic data (600 samples) with the following input features:

| Feature | Description |
|---|---|
| `income` | Monthly income (₹) |
| `debt` | Monthly debt / EMIs (₹) |
| `credit_utilization` | Credit limit utilization (%) |
| `past_default` | Binary — prior default history (0 / 1) |
| `employment_years` | Years in current/total employment |
| `num_loans` | Number of active loans |
| `late_payments` | Count of late payments |

**Pipeline:** `StandardScaler → LogisticRegression → CalibratedClassifierCV (sigmoid, cv=5)`

Outputs a `probability_of_default` score used by the decision engine to produce:
- **Credit Score** — `(1 − probability) × 100` (0–100 scale)
- **Risk tier** — Low / Medium / High
- **Decision** — Approve / Review / Reject

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirement.txt

# Create .env file
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Train the ML model (only once)
python train.py

# Start the API server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Auto-generated docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Environment Variables

**Backend `.env`:**
```
DATABASE_URL=postgresql://user:password@host/dbname
SECRET_KEY=your-secure-random-secret
ACCESS_TOKEN_EXPIRE_HOURS=24
MODEL_PATH=model/model.pkl
```

**Frontend `.env`:**
```
VITE_API_URL=https://your-backend-url.com
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | None | Register a new user |
| POST | `/auth/login` | None | Login, receive JWT |
| POST | `/predict` | User | Submit loan application, get risk assessment |
| GET | `/my-applications` | User | Get current user's application history |
| GET | `/applications` | Admin | Get all applications (filterable by risk/decision) |
| GET | `/applications/{id}` | Admin | Get a single application by ID |
| PATCH | `/applications/{id}/override` | Admin | Override an application decision |

---

## Project Structure

```
FinRisk/
├── backend/
│   ├── main.py                    # FastAPI app, CORS, router registration
│   ├── train.py                   # Model training script
│   ├── requirement.txt
│   └── app/
│       ├── db.py                  # SQLAlchemy engine + session
│       ├── models/
│       │   ├── orm_models.py      # User + Application ORM models
│       │   └── ml_model.py        # Model loader + predict_risk()
│       ├── routes/
│       │   ├── auth.py            # /auth/signup, /auth/login
│       │   └── applications.py    # /predict, /my-applications, /applications
│       ├── schemas/
│       │   └── user_schema.py     # Pydantic request/response schemas
│       ├── services/
│       │   ├── riskcalculator.py  # DTI calculation
│       │   └── decisionengine.py  # Risk tier + decision logic
│       └── utils/
│           ├── auth.py            # JWT + bcrypt helpers
│           ├── deps.py            # Auth dependency injection
│           └── helpers.py
├── frontend/
│   ├── src/
│   │   ├── app.jsx                # Root routes
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── UI.jsx             # Shared design system components
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── pages/
│   │   │   ├── Apply.jsx          # Credit assessment form + result panel
│   │   │   ├── MyApplications.jsx
│   │   │   ├── Admin.jsx          # Admin dashboard + override controls
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   └── services/
│   │       └── api.js             # Axios client + API calls
│   ├── package.json
│   └── vite.config.js
```

---

## Deployment

- **Frontend** — Deployed on [Cloudflare Pages](https://pages.cloudflare.com/) at `finrisk.pages.dev`
- **Backend** — Compatible with Railway, Render, or any platform supporting Python + environment variables
- **Database** — [Neon](https://neon.tech) serverless PostgreSQL (SSL required)

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT
