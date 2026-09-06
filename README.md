# METRON — Retail Pricing Intelligence

METRON is an applied machine-learning decision-intelligence platform for retail pricing. It combines demand forecasting, product-level price-response estimation, promotion analysis, scenario simulation, optimization, guardrails, uncertainty, explainability, human review signals, and model monitoring behind a FastAPI service and React/Vite decision workspace.

> Independent portfolio project. The included dataset is synthetic and is intended for development, testing, and demonstration. No production business performance is claimed.

## Decision loop

```text
Retail history
    ↓
Validation + feature engineering
    ↓
Demand forecast ──────┐
                      ├──→ Scenario simulator → Guardrails → Optimizer
Price response ───────┤                                      ↓
Promotion uplift ─────┘                                Recommendation
                                                           ↓
                                             Confidence + explanation
                                                           ↓
                                                     Human review
                                                           ↓
                                                       Monitoring
```

## Capabilities

1. Demand forecasting with lag, rolling, price, promotion, calendar, product, store, and category features.
2. Baseline/model evaluation with MAE, RMSE, and WAPE on a time-based holdout.
3. Product-level price elasticity estimation with controls for promotion, seasonality, and weekend effects.
4. Promotion uplift diagnostics.
5. Product and store-specific price scenario simulation.
6. Constraint-aware optimization with margin floors, movement bands, and price rounding.
7. Uncertainty intervals and confidence levels based on observed model error and elasticity evidence.
8. Decision explanations showing price response, demand trend, promotion, and guardrail factors.
9. Product portfolio segmentation through elasticity/confidence signals and a human-review path.
10. Development monitoring for demand drift plus runtime/model health endpoints.
11. React/Vite dashboard with product names, product/store selection, scenario frontier, demand intelligence, elasticity, portfolio, and model-health views.

## Run locally

### Backend

```powershell
python -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -e ".[dev]"
python pipelines\\generate_demo_data.py
python pipelines\\train.py
python pipelines\\evaluate.py
pytest -q
uvicorn api.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5173`

## API surface

- `GET /health` — runtime, model, evaluation status
- `GET /products` — product catalog and model signals
- `GET /products/{product_id}` — product/store detail and observed response diagnostics
- `POST /pricing/recommend` — constrained recommendation with scenarios, uncertainty, and explanation
- `POST /pricing/simulate` — product/store simulation endpoint
- `GET /dashboard/summary` — dashboard KPIs, recent commercial series, portfolio, and monitoring

## Engineering notes

The demo data is deliberately synthetic. The model and optimization surfaces are designed so a public retail dataset can replace the generator without changing the decision API contract. Production deployment would additionally require real data contracts, stronger causal identification for pricing effects, backtesting across multiple time windows, calibration of uncertainty, approval/audit workflows, observability, and model governance.
