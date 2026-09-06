<div align="center">

# METRON — Retail Pricing Intelligence

**Applied ML • Demand Forecasting • Price Optimization • Decision Intelligence**

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-orange.svg)](https://scikit-learn.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED.svg)](https://www.docker.com/)
[![Pytest](https://img.shields.io/badge/Pytest-Tested-0A9EDC.svg)](https://pytest.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

> An end-to-end retail pricing intelligence platform for demand forecasting, price-response modeling, scenario simulation, constrained optimization, and explainable price recommendations.

**Portfolio / research prototype:** METRON uses synthetic retail data for development and demonstration. It is not presented as production performance or as a claim of deployment for any specific retailer.

---

## Overview

METRON is an applied machine learning platform designed around a practical retail decision:

> Given historical demand, pricing, promotion, product, store, inventory, and calendar signals, what price should be considered next, and how confident are we?

The system combines:

- Demand forecasting
- Price-response / elasticity modeling
- Promotion uplift diagnostics
- Scenario simulation
- Revenue and profit optimization
- Business constraint enforcement
- Confidence estimation
- Human-review routing
- Explainable pricing recommendations
- Model and data monitoring
- REST API serving
- React-based decision dashboard

The project is designed as an end-to-end applied ML system rather than a standalone notebook model.

---

## System Capabilities

| Capability | Description |
|---|---|
| Demand Forecasting | Predict expected product demand from historical and commercial signals |
| Price Response | Estimate SKU/store-level price elasticity using historical observations |
| Promotion Analysis | Diagnose promotional demand uplift |
| Scenario Simulation | Evaluate multiple candidate prices before making a recommendation |
| Optimization | Select prices based on revenue or profit objectives |
| Guardrails | Enforce margin floors, price movement limits, rounding, and feasibility constraints |
| Confidence | Estimate recommendation confidence from model and elasticity diagnostics |
| Human Review | Flag low-confidence or boundary-sensitive recommendations |
| Explainability | Provide business-readable reasoning behind recommendations |
| Monitoring | Track demand drift and model health indicators |
| API | Serve recommendations, catalog data, simulations, and dashboard summaries |
| Dashboard | Provide a premium black decision-intelligence interface |

---

## Architecture

    RETAIL DATA
         |
         v
    +-------------------+
    | Data Validation   |
    | & Feature Engine  |
    +---------+---------+
              |
       +------+------+
       |             |
       v             v
    +---------+   +--------------------+
    | Demand  |   | Price Response     |
    | Model   |   | / Elasticity Model |
    +----+----+   +---------+----------+
         |                  |
         +--------+---------+
                  |
                  v
        +-------------------+
        | Scenario          |
        | Simulator         |
        +---------+---------+
                  |
                  v
        +-------------------+
        | Constraint        |
        | Engine            |
        +---------+---------+
                  |
                  v
        +-------------------+
        | Price Optimizer   |
        +---------+---------+
                  |
             +----+----+
             |         |
             v         v
        +---------+ +---------+
        | FastAPI | | React   |
        | Backend | | UI      |
        +---------+ +---------+

---

## Decision Flow

    Historical Demand
           |
           v
    Forecast Demand
           |
           v
    Estimate Price Response
           |
           v
    Generate Candidate Prices
           |
           v
    Simulate Demand / Revenue / Profit
           |
           v
    Apply Business Constraints
           |
           v
    Select Best Feasible Scenario
           |
           v
    Calculate Confidence
           |
           v
    Human Review Check
           |
           v
    Recommended Price

---

## Project Structure

    METRON-Retail-Pricing-Intelligence/
    │
    ├── api/
    │   └── main.py
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── App.jsx
    │   │   ├── App.css
    │   │   ├── index.css
    │   │   └── main.jsx
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── vite.config.js
    │   ├── index.html
    │   └── .env.example
    │
    ├── src/
    │   └── metron/
    │       ├── __init__.py
    │       ├── features.py
    │       ├── forecasting.py
    │       ├── pricing.py
    │       ├── elasticity.py
    │       ├── catalog.py
    │       ├── evaluation.py
    │       ├── monitoring.py
    │       └── io.py
    │
    ├── pipelines/
    │   ├── generate_demo_data.py
    │   ├── train.py
    │   ├── evaluate.py
    │   └── predict.py
    │
    ├── configs/
    │   └── default.json
    │
    ├── data/
    │   ├── raw/
    │   │   └── .gitkeep
    │   └── processed/
    │       └── .gitkeep
    │
    ├── models/
    │   └── .gitkeep
    │
    ├── artifacts/
    │   └── .gitkeep
    │
    ├── notebooks/
    │   └── exploration/
    │       └── .gitkeep
    │
    ├── tests/
    │   ├── test_features.py
    │   ├── test_pricing.py
    │   └── test_api.py
    │
    ├── .github/
    │   └── workflows/
    │       └── ci.yml
    │
    ├── Dockerfile
    ├── docker-compose.yml
    ├── .env.example
    ├── .gitignore
    ├── pyproject.toml
    ├── README.md
    └── LICENSE

---

## Dataset

METRON currently uses synthetically generated retail data for development and testing.

The generated dataset contains fields including:

- `date`
- `product_id`
- `product_name`
- `store_id`
- `store_name`
- `category`
- `price`
- `cost`
- `promo`
- `inventory`
- `units_sold`
- `revenue`
- `gross_profit`

The demo generator creates a multi-product, multi-store time series suitable for exercising the complete ML pipeline.

No proprietary retailer dataset is included.

---

## Installation

### Clone the Repository

    git clone https://github.com/JOHNSANJITH/METRON-Retail-Pricing-Intelligence.git
    cd METRON-Retail-Pricing-Intelligence

### Create a Virtual Environment

Windows:

    python -m venv .venv
    .venv\Scripts\activate

Linux / macOS:

    python -m venv .venv
    source .venv/bin/activate

### Install Backend Dependencies

    pip install -e .

### Install Frontend Dependencies

    cd frontend
    npm install
    cd ..

---

## Data Generation

Generate the synthetic development dataset:

    python pipelines/generate_demo_data.py

The generated data is written to:

    data/raw/demo_retail.csv

---

## Training

Train the demand forecasting model:

    python pipelines/train.py

The trained model is saved under:

    models/

The forecasting pipeline uses a gradient-boosted regression model with commercial, temporal, product, and store features.

---

## Evaluation

Evaluate the trained model:

    python pipelines/evaluate.py

Evaluation includes:

- MAE
- RMSE
- WAPE

Example development output:

    {
        "mae": ...,
        "rmse": ...,
        "wape": ...
    }

These values are generated from synthetic development data and should not be interpreted as production performance.

---

## Price Response / Elasticity

METRON estimates product/store-level price response using historical observations.

The elasticity model incorporates:

- Historical price
- Historical demand
- Promotion effects
- Seasonal controls
- Weekend effects

Elasticity is categorized into:

    Elastic
    Unit Elastic
    Inelastic

The system also exposes:

- Elasticity estimate
- Confidence
- Observation count
- R²
- Response level

---

## Scenario Simulation

METRON does not immediately return a price based on a single model output.

Instead, it evaluates a range of candidate prices.

For each candidate price, the system estimates:

    Expected Demand
    Expected Revenue
    Expected Profit
    Margin
    Price Change %
    Feasibility

This creates a scenario frontier that allows the recommendation to be understood as a decision rather than simply a prediction.

---

## Optimization

The pricing engine supports multiple commercial objectives.

### Revenue Objective

Select the feasible price that maximizes expected revenue.

### Profit Objective

Select the feasible price that maximizes expected gross profit.

### Guardrails

Candidate prices can be constrained using:

- Minimum margin
- Maximum price movement
- Minimum price
- Maximum price
- Price rounding
- Promotion conditions
- Inventory considerations
- Feasibility checks

Only feasible scenarios are eligible for recommendation.

---

## Confidence & Explainability

METRON separates the recommendation from the confidence associated with it.

Confidence is influenced by model and price-response diagnostics.

Recommendations can be routed for human review when:

- Confidence is low
- The recommendation is close to a constraint boundary
- The estimated price response is uncertain

The system also generates business-readable explanations covering:

- Price response
- Recent demand
- Promotion effects
- Guardrails
- Recommendation rationale

---

## REST API

The backend is implemented with FastAPI.

Start the API:

    uvicorn api.main:app --reload

The API is available at:

    http://127.0.0.1:8000

### Health

    GET /health

Returns model availability, version information, evaluation metadata, and data mode.

### Products

    GET /products

Returns the available product and store catalog.

### Product Details

    GET /products/{product_id}

Returns product-level information and recent data.

### Pricing Recommendation

    POST /pricing/recommend

Returns:

- Recommended price
- Expected demand
- Expected revenue
- Expected profit
- Confidence
- Review status
- Explanation
- Candidate scenarios

### Pricing Simulation

    POST /pricing/simulate

Evaluates candidate prices without necessarily selecting a final recommendation.

### Dashboard Summary

    GET /dashboard/summary

Provides aggregated information used by the decision dashboard.

---

## Frontend

The METRON dashboard is built with:

- React
- Vite
- CSS
- REST API integration

The interface follows a premium black decision-intelligence design.

Main sections include:

    Overview
    Pricing Lab
    Demand
    Elasticity
    Products
    Model Health

The Pricing Lab provides:

- Product selection
- Store selection
- Current price
- Unit cost
- Promotion status
- Objective selection
- Recommended price
- Scenario frontier
- Demand intelligence
- Elasticity information
- Recommendation explanation
- Human-review status

Run the frontend:

    cd frontend
    npm run dev

Then open:

    http://localhost:5173

---

## Tech Stack

    +------------------------------------------------------+
    |                    METRON STACK                      |
    +------------------------------------------------------+
    | Language       | Python, JavaScript                  |
    | ML             | scikit-learn                        |
    | Forecasting    | HistGradientBoostingRegressor      |
    | API            | FastAPI                             |
    | Frontend       | React + Vite                        |
    | Data           | Pandas / NumPy                      |
    | Validation     | Pytest                              |
    | Container      | Docker                              |
    | CI             | GitHub Actions                      |
    | Configuration  | JSON / Environment Variables        |
    +------------------------------------------------------+

---

## Testing

Run the complete test suite:

    pytest -q

The test suite covers:

- Feature generation
- Pricing logic
- API health
- Product endpoints
- Pricing recommendation behavior

Current development verification:

    5 passed

Warnings from development dependencies may appear depending on the installed FastAPI, Starlette, and AnyIO versions.

---

## Docker

Build the application:

    docker build -t metron .

Run with Docker Compose:

    docker compose up --build

The containerized setup provides a reproducible environment for the backend and supporting services.

---

## Engineering Decisions

### Separate Forecasting and Price Response

Demand forecasting and price response answer different questions.

The demand model estimates expected demand from commercial and temporal signals, while the elasticity component estimates how demand changes with price.

Keeping these components separate makes the system easier to inspect and extend.

### Scenario-Based Optimization

The system evaluates candidate prices rather than treating the model output as the final decision.

This allows commercial constraints to be incorporated explicitly.

### Constraint-First Decisioning

A mathematically attractive price is not necessarily commercially valid.

METRON therefore applies business constraints before selecting the final recommendation.

### Human-in-the-Loop

Low-confidence recommendations should not automatically become business actions.

The system can flag recommendations that require human review.

### Synthetic Development Data

Synthetic data keeps the repository reproducible and avoids exposing proprietary retail information.

---

## Limitations

METRON is currently a portfolio-scale applied ML prototype.

Important limitations include:

- Synthetic rather than proprietary retail data
- Limited historical data realism compared with enterprise datasets
- Simplified price-response assumptions
- No production-grade experimentation platform
- No automated model registry
- No production feature store
- No full causal inference framework
- No real-time retailer integration
- Simplified monitoring and drift detection
- No guaranteed business or financial outcome

The current system demonstrates engineering architecture and decision logic rather than production deployment readiness.

---

## Production Considerations

A production deployment could extend METRON with:

- PostgreSQL or warehouse-backed data infrastructure
- MLflow or another model registry
- Scheduled retraining pipelines
- Feature-store integration
- Automated model validation
- More robust demand forecasting models
- Causal promotion analysis
- Hierarchical forecasting
- Experimentation / A-B testing
- Advanced demand elasticity estimation
- Real-time inventory integration
- Production observability
- Data-quality monitoring
- Model drift monitoring
- Authentication and authorization
- Role-based approval workflows
- Audit logging

---

## Development Workflow

Create a feature branch:

    git checkout -b feature/<short-description>

Install dependencies:

    pip install -e .
    cd frontend
    npm install

Run tests:

    pytest -q

Run the backend:

    uvicorn api.main:app --reload

Run the frontend:

    cd frontend
    npm run dev

Before opening a pull request:

    pytest -q

and verify the frontend builds successfully.

---

## Branch Naming

Use descriptive branch names:

    feature/<feature-name>
    fix/<bug-name>
    refactor/<area>
    docs/<documentation-change>
    test/<test-change>
    chore/<maintenance-task>

Examples:

    feature/price-simulation
    feature/elasticity-dashboard
    fix/pricing-api
    docs/update-readme

---

## Commit Convention

Use concise, descriptive commits.

Examples:

    feat: add pricing scenario simulation
    feat: add elasticity diagnostics
    fix: correct pricing recommendation response
    refactor: separate forecasting and pricing logic
    test: add pricing API coverage
    docs: update project documentation
    chore: improve CI configuration

---

## Repository Quality Gates

Before considering a change complete:

    [ ] Tests pass
    [ ] Python compilation succeeds
    [ ] No secrets committed
    [ ] Configuration is environment-driven
    [ ] API behavior is verified
    [ ] Frontend behavior is verified
    [ ] README reflects current functionality
    [ ] Synthetic data is clearly identified
    [ ] Production claims are not overstated

---

## Portfolio Positioning

METRON is part of a broader applied AI/ML portfolio.

| Project | Primary Focus |
|---|---|
| Veyra | Hybrid Graph-Augmented RAG / LLM Retrieval |
| Diabetic Retinopathy Detection | Computer Vision / Medical Image Classification |
| AEGIS | Industrial Safety Computer Vision |
| METRON | Applied ML / Forecasting / Pricing Optimization / Decision Intelligence |

METRON demonstrates the ability to connect:

    Data
      ↓
    Feature Engineering
      ↓
    Machine Learning
      ↓
    Scenario Simulation
      ↓
    Optimization
      ↓
    Business Constraints
      ↓
    Decision Support
      ↓
    API + Production-Style Dashboard

---

## Project Status

**Status: Portfolio-ready applied ML prototype**

Current implementation includes:

- Demand forecasting
- Price-response modeling
- Promotion diagnostics
- Scenario simulation
- Revenue/profit optimization
- Pricing guardrails
- Confidence estimation
- Human-review routing
- Explainability
- Monitoring
- FastAPI backend
- React dashboard
- Docker configuration
- Automated tests
- CI configuration
- Synthetic data generation

---

## License

This project is released under the MIT License.

See [LICENSE](LICENSE) for details.

---

<div align="center">

## Author

**John**

AI / ML Engineer  
Python | Computer Vision | LLM / RAG Systems | Applied Machine Learning

[GitHub](https://github.com/JOHNSANJITH)

</div>
