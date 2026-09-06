METRON — Retail Pricing Intelligence

METRON is an applied machine-learning decision-intelligence platform for retail pricing. It combines demand forecasting, product-level price-response estimation, promotion analysis, scenario simulation, optimization, commercial guardrails, uncertainty, explainability, human review signals, and model monitoring behind a FastAPI service and React/Vite decision workspace.

Portfolio project. The included dataset is synthetic and is intended for development, testing, and demonstration. No production business performance is claimed.

Overview

METRON demonstrates an end-to-end ML workflow for turning retail history into constraint-aware pricing recommendations.

The system separates prediction from the final business decision:

Demand forecasting

Price-response and elasticity modeling

Promotion analysis

Scenario simulation

Price optimization

Commercial guardrails

Confidence and uncertainty

Decision explanations

Human-review signals

Model monitoring

REST API

Interactive decision dashboard

The emphasis is on building an engineered ML decision system rather than only training a forecasting model.

System Capabilities

Capability

Implementation

Demand Forecasting

Gradient-boosted regression

Features

Price, promotion, lag, rolling, calendar, product, store, category

Evaluation

MAE, RMSE, WAPE

Validation

Time-based holdout

Price Response

Product/store-level elasticity

Promotion

Promotion uplift diagnostics

Simulation

Candidate price scenarios

Optimization

Revenue / gross-profit objectives

Guardrails

Margin floor, movement limits, rounding

Uncertainty

Development demand intervals

Confidence

Elasticity evidence + model fit

Explainability

Price, demand, promotion, guardrail signals

Human Review

Low-confidence / boundary-case signals

Monitoring

Demand drift + model health

Backend

FastAPI

Frontend

React + Vite

Testing

Pytest

Deployment

Docker + Docker Compose

CI

GitHub Actions

Configuration

JSON + environment configuration

Architecture

                         ┌──────────────────────┐
                         │    Retail History    │
                         │   Synthetic Demo     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Validation + Feature │
                         │     Engineering      │
                         └──────────┬───────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                ┌─────────────────┐   ┌─────────────────┐
                │ Demand Forecast │   │ Price Response  │
                │     Model       │   │   / Elasticity  │
                └────────┬────────┘   └────────┬────────┘
                         │                     │
                         └──────────┬──────────┘
                                    ▼
                         ┌──────────────────────┐
                         │ Scenario Simulator   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Constraint Engine    │
                         │ + Commercial Guards  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Price Optimizer    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Recommendation     │
                         └──────────┬───────────┘
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                  ┌─────────────┐       ┌─────────────┐
                  │ Explanation │       │ Confidence  │
                  └──────┬──────┘       └──────┬──────┘
                         │                     │
                         └──────────┬──────────┘
                                    ▼
                         ┌──────────────────────┐
                         │    Human Review      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Monitoring      │
                         └──────────────────────┘

Decision Flow

Retail Data
    ↓
Demand Forecast
    ↓
Price Response
    ↓
Scenario Simulation
    ↓
Commercial Guardrails
    ↓
Price Optimization
    ↓
Recommendation
    ↓
Confidence + Explanation
    ↓
Human Review
    ↓
Monitoring

Project Structure

METRON-Retail-Pricing-Intelligence/
│
├── api/
│   └── main.py
│
├── configs/
│   └── default.json
│
├── data/
│   ├── raw/
│   └── processed/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── models/
│
├── pipelines/
│   ├── generate_demo_data.py
│   ├── train.py
│   ├── evaluate.py
│   └── predict.py
│
├── src/
│   └── metron/
│       ├── catalog.py
│       ├── elasticity.py
│       ├── evaluation.py
│       ├── features.py
│       ├── forecasting.py
│       ├── io.py
│       ├── monitoring.py
│       └── pricing.py
│
├── tests/
│   ├── test_api.py
│   ├── test_features.py
│   └── test_pricing.py
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
└── README.md

Dataset

METRON uses a synthetic retail dataset generated for development and testing.

The dataset contains:

date
product_id
product_name
store_id
store_name
category
price
cost
promo
inventory
units_sold
revenue
gross_profit

The data generator is separated from the ML and pricing layers so a public or production retail dataset can replace it without changing the core decision API contract.

Installation

Python 3.10+ is recommended.

Windows PowerShell

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"

Generate Demo Data

python pipelines\generate_demo_data.py

Training

python pipelines\train.py

The training pipeline builds historical demand features, trains the forecasting model, and saves the trained artifact.

models/demand_model.joblib

Evaluation

python pipelines\evaluate.py

The demand model uses a time-based holdout and reports:

Metric

Purpose

MAE

Average absolute demand error

RMSE

Penalizes larger errors

WAPE

Scale-normalized demand error

Evaluation results are based on synthetic data and should not be interpreted as production retail performance.

Price Elasticity

METRON estimates product/store-level price response using historical observations.

The elasticity layer incorporates:

Price

Promotion controls

Seasonal effects

Weekend effects

Observation count

Model fit

Confidence classification

Products can be categorized as:

Elastic
Unit Elastic
Inelastic

Elasticity is treated as decision-support evidence rather than an unconditional causal estimate.

Scenario Simulation

METRON evaluates multiple candidate prices rather than returning only a model prediction.

Current Price
      ↓
Candidate Prices
      ↓
Demand Simulation
      ↓
Revenue / Profit Estimation
      ↓
Guardrail Filtering
      ↓
Best Feasible Scenario

Each scenario contains expected demand, revenue, gross profit, margin, price movement, and feasibility.

Optimization & Guardrails

Current pricing constraints include:

Minimum margin floor

Maximum price movement

Price rounding

Revenue / profit objective

Product/store context

The optimizer selects the best feasible candidate after applying commercial constraints.

Confidence & Explainability

METRON surfaces decision evidence instead of presenting every recommendation as equally reliable.

Confidence considers elasticity evidence, model fit, and available observations.

Recommendations can trigger human review when:

Confidence is low

Evidence is limited

The recommendation approaches a guardrail boundary

Decision explanations include:

Price-response behavior

Recent demand trend

Promotion state

Guardrails

Confidence

Human-review status

REST API

Start the API:

uvicorn api.main:app --reload

API:

http://127.0.0.1:8000

Interactive documentation:

http://127.0.0.1:8000/docs

API Surface

Method

Endpoint

Purpose

GET

/health

Runtime and model health

GET

/products

Product catalog and model signals

GET

/products/{product_id}

Product/store details

POST

/pricing/recommend

Generate constrained recommendation

POST

/pricing/simulate

Simulate candidate prices

GET

/dashboard/summary

Dashboard KPIs and monitoring

Frontend

The decision workspace is built with React and Vite.

cd frontend
npm install
npm run dev

Dashboard:

http://127.0.0.1:5173

The workspace includes:

Overview

Pricing Lab

Demand Intelligence

Elasticity

Product Portfolio

Model Health

Tech Stack

┌──────────────────────────────────────────────────────┐
│                    METRON STACK                      │
├──────────────────────────────────────────────────────┤
│ ML / Data       │ Python · Pandas · NumPy            │
│ Modeling        │ scikit-learn · Gradient Boosting   │
│ Pricing         │ Elasticity · Simulation · Optimizer│
│ Backend         │ FastAPI · Pydantic · Uvicorn       │
│ Frontend        │ React · Vite · JavaScript · CSS    │
│ Testing         │ Pytest · GitHub Actions            │
│ Deployment      │ Docker · Docker Compose            │
│ Engineering     │ Git · Config-driven Pipelines      │
└──────────────────────────────────────────────────────┘

Testing

Run:

pytest -q

Tests cover:

Feature generation

Pricing logic

API health

Product endpoints

Pricing recommendations

Docker

Build:

docker compose build

Run:

docker compose up

Engineering Decisions

Prediction Is Not the Decision

The demand model provides a predictive signal. METRON combines it with price response, simulation, constraints, and optimization before producing a recommendation.

Constraints Before Recommendation

Commercial rules are applied before selecting the final price.

Human Review

Low-confidence and boundary-case recommendations are surfaced rather than silently treated as reliable automated decisions.

Synthetic Data Transparency

The development dataset is explicitly synthetic. No production performance is implied.

API Separation

ML, pricing, and optimization logic are separated from the HTTP layer so the core decision components remain independently testable.

Production Considerations

A production deployment would require:

Real retail data contracts and validation

Stronger causal identification of price effects

Multi-window time-series backtesting

Calibrated uncertainty

Experimentation / A-B testing

Inventory and competitor-price signals

Production data infrastructure

Model registry and experiment tracking

Automated retraining

Observability and drift monitoring

Approval and audit workflows

Model governance

These are future production requirements and are not claimed as implemented capabilities.

Limitations

Synthetic data does not represent real retail behavior.

Historical price response does not automatically establish causality.

Elasticity estimates depend on available observations.

Forecast uncertainty is a development approximation.

Real production pricing would require stronger experimentation and validation.

Business constraints would need to be adapted to each retailer.

Project Status

Component

Status

Synthetic data generation

Complete

Feature engineering

Complete

Demand forecasting

Complete

Model evaluation

Complete

Price elasticity

Complete

Promotion analysis

Complete

Scenario simulation

Complete

Price optimization

Complete

Commercial guardrails

Complete

Uncertainty & confidence

Complete

Explainability

Complete

Human review signals

Complete

Monitoring

Complete

FastAPI backend

Complete

React/Vite dashboard

Complete

Automated tests

Complete

CI

Complete

Docker

Complete

Portfolio Positioning

METRON demonstrates the Applied ML / Decision Intelligence side of an AI engineering portfolio.

Data
 ↓
Features
 ↓
Prediction
 ↓
Price Response
 ↓
Simulation
 ↓
Optimization
 ↓
Constraints
 ↓
Recommendation
 ↓
Explanation
 ↓
Human Review
 ↓
Monitoring

The project focuses on turning machine-learning predictions into usable, explainable, and constraint-aware business decisions.

License

See LICENSE.
