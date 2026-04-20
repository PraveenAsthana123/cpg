# CPG Analytics Dashboard

A full-stack enterprise analytics platform for Consumer Packaged Goods (CPG) companies.
Covers 11 functional departments with real-time KPIs, ML-powered forecasting, and
AI-driven explanations via Ollama/RAG.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React + Vite)                  │
│  Left Sidebar Navigation  │  Main Content Area (white bg)   │
└───────────────┬─────────────────────────────────────────────┘
                │ REST / JSON
┌───────────────▼─────────────────────────────────────────────┐
│              FastAPI Backend  (port 8000)                    │
│  Routers → Services → Repositories → PostgreSQL             │
│  Celery Workers (Redis broker) for async ML jobs            │
│  MLflow (host port 5001 → container 5000) for experiments   │
│  Ollama (port 11434) for RAG / AI natural-language answers  │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, native CSS variables, left-sidebar layout |
| Backend | FastAPI (Python 3.11), Pydantic v2, SQLAlchemy (async) |
| Database | PostgreSQL 15 |
| Cache / Queue | Redis 7, Celery 5 |
| ML Platform | MLflow 2, scikit-learn, XGBoost, SHAP |
| AI / RAG | Ollama (llama3), LangChain |
| Containerisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## 11 Department Modules

| # | Department | Key Features |
|---|-----------|-------------|
| 1 | **Sales & Revenue** | Revenue trends, sales velocity, territory performance |
| 2 | **Marketing & Trade Spend** | Campaign ROI, trade promotion effectiveness, attribution |
| 3 | **Supply Chain & Logistics** | Inventory turns, fill rate, lead time, OTIF |
| 4 | **Demand Forecasting** | ML-powered SKU-level forecasts, MAPE/RMSE tracking |
| 5 | **Retail & Channel Analytics** | POS data, shelf analytics, planogram compliance |
| 6 | **Product & Innovation** | NPD pipeline, SKU rationalization, launch tracking |
| 7 | **Finance & P&L** | Gross margin, trade spend waterfall, EBITDA bridge |
| 8 | **Customer & Shopper** | Segmentation, basket analysis, loyalty analytics |
| 9 | **Quality & Compliance** | Defect rates, recall tracking, regulatory compliance |
| 10 | **HR & Workforce** | Headcount, attrition, productivity metrics |
| 11 | **Executive Scorecard** | Consolidated KPIs, AI narrative summaries, alerts |

---

## Quick Start (Docker Compose)

### Prerequisites
- Docker >= 24 and Docker Compose >= 2.20
- 8 GB RAM minimum (16 GB recommended for Ollama)

```bash
# 1. Clone the repository
git clone <repo-url>
cd cpg

# 2. Set up environment
cp .env.template .env
# Edit .env — at minimum set POSTGRES_PASSWORD and KAGGLE credentials

# 3. Start all services
docker compose up -d

# 4. Apply database migrations
docker compose exec backend python -m backend.database

# 5. Open the dashboard
open http://localhost:3000
```

### Service URLs

| Service | URL |
|---------|-----|
| Frontend (Docker) | http://localhost:3000 |
| Frontend (local Vite dev) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| MLflow UI | http://localhost:5001 |
| Flower (Celery monitor) | http://localhost:5555 |

---

## Development Setup (without Docker)

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt -r ../requirements-dev.txt
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
cpg/
├── backend/
│   ├── core/          # Config, auth, middleware, encryption, logging
│   ├── repositories/  # All SQL — one file per table group
│   ├── schemas/       # Pydantic request/response models
│   ├── services/      # Business logic (class-based, injected)
│   ├── routers/       # FastAPI route handlers (HTTP-only)
│   ├── migrations/    # Numbered SQL migration scripts
│   ├── tests/         # Pytest test suite
│   └── main.py        # App entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # One page per department module
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API client
│   │   └── utils/       # Formatters, validators, error tracker
│   └── index.html
├── data/
│   └── kaggle/        # Raw Kaggle datasets (git-ignored)
├── scripts/           # Data ingestion, maintenance utilities
├── docs/              # Architecture and developer guides
├── .env.template      # Environment variable reference
├── docker-compose.yml
└── README.md
```

---

## Contributing

See [docs/CODE_GUIDELINES.md](docs/CODE_GUIDELINES.md) for branching strategy,
commit conventions, and the PR checklist.

All PRs must pass:
- `ruff check` + `black --check`
- `pytest --cov=backend --cov-fail-under=80`
- `npm run validate` (frontend lint + format + unit tests)
- GitHub Actions CI pipeline

---

## Screenshots

The Sales flagship deep-dive ships with 16 captured screenshots demonstrating
live end-to-end behavior — dashboard → department overview → manager hub →
forecast → explain drawer → revenue tree → simulation waterfall → admin
workflows → data-flow graph → role selector. A second gallery covers the
other departments (marketing, supply chain, contact center, telehealth).

- [docs/screenshots/sales/](docs/screenshots/sales/) — 14 Sales flagship captures (dashboard, overview, 10-tab manager hub, forecast empty + generated, explain drawer, revenue drilldown, simulation empty + waterfall, admin workflows, data flow, sidebar expanded, admin AI use cases, role selectors for manager + team-member)
- [docs/screenshots/depts/](docs/screenshots/depts/) — cross-dept overview captures (marketing, supply chain, contact center, telehealth)

### Flagship demo walkthrough

For a narrated 3-scenario walkthrough of the Sales flagship (revenue-drop
investigation, 8-week forecast + confidence, promo ROI simulation with RBAC
gating) see [docs/demo/sales-walkthrough.md](docs/demo/sales-walkthrough.md).

### Architecture diagrams

Mermaid diagrams covering the full Sales flow (rendered inline on GitHub):

- [docs/diagrams/sales-architecture.md](docs/diagrams/sales-architecture.md) — C4-lite container view
- [docs/diagrams/sales-forecast-sequence.md](docs/diagrams/sales-forecast-sequence.md) — Prophet fit + predict sequence
- [docs/diagrams/sales-rag-sequence.md](docs/diagrams/sales-rag-sequence.md) — AI Explain RAG hybrid retrieval sequence
- [docs/diagrams/sales-rbac-flow.md](docs/diagrams/sales-rbac-flow.md) — Demo-mode RBAC enforcement sequence

### Implementation status

A living "Implemented vs Planned" snapshot is maintained at
[docs/STATUS.md](docs/STATUS.md). After Sales Phases α–θ, the Sales flagship
is end-to-end complete (data, forecast, simulation, frontend, RAG,
observability, RBAC, docs); Supply Chain is next.
