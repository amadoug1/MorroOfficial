# MORRO

Storefront for MORRO — quiet luxury menswear, released in drops.

## Stack

- **frontend/** — React (CRA + CRACO), Tailwind, Framer Motion, Lenis
- **backend/** — FastAPI, MongoDB (Motor), Stripe Checkout, JWT admin auth

## Running locally

Requirements: Node 20, Yarn, Python 3.11+, MongoDB.

```bash
# backend
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn server:app --port 8001 --reload
```

```bash
# frontend
cd frontend
yarn install
PORT=3002 yarn start
```

### Environment

`backend/.env`

| Variable | Purpose |
| --- | --- |
| `MONGO_URL`, `DB_NAME` | Database connection |
| `JWT_SECRET` | Signs admin sessions and drop passes |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seeds the first admin account |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout |

`frontend/.env`

| Variable | Purpose |
| --- | --- |
| `REACT_APP_BACKEND_URL` | Base URL of the API, e.g. `http://localhost:8001` |

## Drop Mode

Toggle it in **Studio → Drop Mode** (`/admin`).

- While live, visitors see the countdown page, and the API refuses product and checkout requests for them.
- Signed-in admins still see and can edit the full site, with a banner showing that Drop Mode is live.
- Visitors with the early-access password get a signed 24-hour pass.
- If a drop date is set, Drop Mode turns itself off when that time passes.
