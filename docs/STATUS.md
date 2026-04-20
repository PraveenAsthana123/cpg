# CPG Platform — Implementation Status

Updated 2026-04-19 after Sales Phases α–θ.

## What ships today (end-to-end working)

### Infrastructure
- 14-dept sidebar navigation with Admin + Manager sub-links
- 15 routable pages (1 dashboard, 14 dept homes, 14 admin, 14 manager, 1 /data-flow)
- Vite proxy for CORS-free dev
- Postgres 16 + 1.017 M-row Rossmann dataset

### Sales flagship (full deep-dive)
- **α Data**: Rossmann ingestion, 1,115 stores, 942 dates, 1,017,209 fact rows
- **β Forecast**: Prophet per-store, MAPE 14.7% for store 1, ~100 ms fit, LRU cache
- **δ Simulation**: price × promo waterfall, constant elasticity (-2.0), 30% margin
- **ε Frontend**: 6 screens — Overview, Revenue Tree, Forecast, ExplainDrawer, Simulation placeholder → live, Anomaly queue stub
- **γ RAG**: hybrid retrieval (BM25 + numpy cosine over Ollama embeddings), citation-required guardrail, eval harness (groundedness via Ollama judge)
- **ζ Observability**: structured JSON logs with correlation_id contextvar, per-endpoint event rows
- **η RBAC**: demo-mode with 4 roles, middleware enforces permission matrix, topbar role selector
- **θ Docs**: demo walkthrough + Mermaid diagrams

### Cross-cutting
- 77 AI use cases catalogued across all 14 depts (AIUseCasesTab)
- 193 enhancement workflows × 4 roles (WorkflowsTab)
- 20 data-flow edges (DataFlowPage)
- 16 screenshots demonstrating live behavior

## What's planned (Phase 2a-2 onwards)

### Supply Chain flagship (next)
Scope documented in `docs/specs/SUPPLY_CHAIN_SCENARIOS.md`. 6 screens, 7 AI use cases, 36-h effort, ~8 h saved via reuse from Sales.

### Executive Scorecard (third flagship)
Rolls up KPIs across all depts, AI weekly narrative, strategy simulator. Spec not yet written.

### Cross-cutting polish (Phase 2b)
- OpenTelemetry spans (logs already emit; tracing pending)
- Real judge model for RAG eval (currently self-judges with qwen2.5)
- Per-store elasticity learning (currently constant)
- Promo + state-holiday Prophet regressors with future-values policy
- LLM hallucination / bias detection beyond citation-required
- Real JWT-based auth (demo-mode RBAC replaces real sessions)

### Long-tail
- Other 13 depts' deep dives (pattern established; each is ~20-30 h reuse-assisted)
- GRC / Governance flagship (reviewer-proposed 15th dept)
- Cross-dept data-flow interactive visualization (currently table)

## Tests ship green

- **45/45 backend** (40 prior + 5 RBAC), opt-in eval harness for RAG groundedness
- **29/29 Playwright** — admin-manager-hubs (13), capture-screenshots (12), capture-all-depts (4), ai-use-cases tests
- **Vite build** clean

## How to run

```bash
# 1. Data
docker compose up -d postgres
docker compose exec -T postgres psql -U cpg_user -d cpg_analytics < backend/migrations/010_sales_rossmann.sql
./scripts/download_rossmann.sh data/kaggle/rossmann  # or use existing data/
python scripts/ingest_rossmann.py --dir data/kaggle/rossmann

# 2. Backend (port 8001)
cd backend && uvicorn main:app --port 8001 --host 127.0.0.1 &

# 3. Frontend
cd frontend && npm run dev

# 4. Browse
open http://localhost:5173
```

Ollama at `localhost:11434` with `qwen2.5:latest` is required for AI Explain.
Without it, the RAG endpoint returns 503 gracefully.
