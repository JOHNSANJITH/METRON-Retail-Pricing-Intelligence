from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from metron.features import build_features
from metron.elasticity import estimate_elasticity, promotion_uplift
from metron.pricing import optimize_price
from metron.monitoring import drift_score, drift_state
from metron.catalog import PRODUCT_NAMES, STORE_NAMES

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "raw" / "demo_retail.csv"
MODEL_PATH = ROOT / "models" / "demand_model.joblib"
EVAL_PATH = ROOT / "artifacts" / "evaluation.json"

app = FastAPI(title="METRON Retail Pricing Intelligence API", version="2.0.0", description="Retail demand forecasting, price-response analysis, scenario simulation, optimization, explainability and monitoring.")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class PricingRequest(BaseModel):
    product_id: str = "SKU-0001"
    store_id: str = "STORE-001"
    current_price: float | None = Field(default=None, gt=0)
    cost: float | None = Field(default=None, ge=0)
    promo: int = Field(default=0, ge=0, le=1)
    objective: str = Field(default="profit", pattern="^(profit|revenue)$")
    max_price_change: float = Field(default=.10, gt=0, le=.50)
    min_margin: float = Field(default=.05, ge=0, lt=1)

class SimulationRequest(PricingRequest):
    pass

def _load():
    if not DATA_PATH.exists() or not MODEL_PATH.exists():
        raise HTTPException(status_code=503, detail="Train the METRON model first")
    raw = pd.read_csv(DATA_PATH, parse_dates=["date"])
    featured = build_features(raw)
    model = joblib.load(MODEL_PATH)
    return raw, featured, model

def _latest(raw, featured, product_id, store_id):
    x = featured[(featured.product_id == product_id) & (featured.store_id == store_id)].sort_values("date")
    if x.empty: raise HTTPException(status_code=404, detail="Product/store combination not found")
    return x.iloc[-1].copy(), x

def _predict_row(model, row, price, promo):
    x = row.copy()
    x["price"] = price; x["promo"] = promo
    frame = pd.DataFrame([x])
    demand = max(0.0, float(model.pipeline.predict(frame)[0]))
    return demand

def _decision(raw, featured, model, req):
    row, history = _latest(raw, featured, req.product_id, req.store_id)
    current = float(req.current_price or row.price)
    cost = float(req.cost if req.cost is not None else row.cost)
    elasticity = estimate_elasticity(raw, req.product_id, req.store_id)
    uplift = promotion_uplift(raw, req.product_id, req.store_id)
    baseline = _predict_row(model, row, current, 0)
    def demand_fn(price):
        demand = _predict_row(model, row, price, req.promo)
        # The model already sees promotion; uplift is reported as a separate diagnostic, not double-counted.
        return demand
    best, scenarios = optimize_price(current, cost, demand_fn, objective=req.objective, min_multiplier=1-req.max_price_change, max_multiplier=1+req.max_price_change, min_margin=req.min_margin, step=max(current*.01, .01), rounding=.01)
    mae = 0.0
    if EVAL_PATH.exists():
        try: mae = float(json.loads(EVAL_PATH.read_text(encoding="utf-8")).get("mae", 0))
        except Exception: pass
    lo = max(0.0, best.expected_demand - 1.64 * mae)
    hi = best.expected_demand + 1.64 * mae
    confidence = "High" if elasticity.confidence == "High" and elasticity.r2 >= .25 else "Medium" if elasticity.confidence != "Low" else "Low"
    review = confidence == "Low" or abs(best.price/current-1) >= req.max_price_change*.9
    price_impact = (best.expected_demand / max(baseline, 1e-9) - 1) * 100
    explanation = [
        {"factor":"Price response", "effect": "negative" if best.price > current else "positive", "detail": f"Estimated elasticity {elasticity.elasticity:.2f}"},
        {"factor":"Recent demand", "effect": "positive" if row.rolling_7 >= row.rolling_28 else "negative", "detail": f"7-day average {row.rolling_7:.1f} vs 28-day {row.rolling_28:.1f}"},
        {"factor":"Promotion", "effect": "positive" if req.promo else "neutral", "detail": f"Observed promotion uplift proxy {uplift*100:.1f}%"},
        {"factor":"Guardrails", "effect": "neutral", "detail": f"Movement capped at ±{req.max_price_change*100:.0f}% with {req.min_margin*100:.0f}% margin floor"},
    ]
    return row, elasticity, best, scenarios, {"low":lo,"high":hi}, confidence, review, explanation, price_impact

@app.get("/health")
def health():
    model_ok = MODEL_PATH.exists()
    metrics = json.loads(EVAL_PATH.read_text(encoding="utf-8")) if EVAL_PATH.exists() else {}
    return {"status":"ok", "model_available":model_ok, "version":"2.0.0", "evaluation":metrics, "data_mode":"synthetic_development"}

@app.get("/products")
def products():
    raw, featured, model = _load()
    rows=[]
    for (pid, store_id), g in raw.groupby(["product_id", "store_id"]):
        latest = g.sort_values("date").iloc[-1]
        e = estimate_elasticity(raw, pid, store_id)
        f = featured[(featured.product_id==pid)&(featured.store_id==store_id)].sort_values("date").iloc[-1]
        rows.append({"product_id":pid,"product_name":latest.product_name,"category":latest.category,"store_id":store_id,"store_name":latest.store_name,"current_price":float(latest.price),"cost":float(latest.cost),"forecast_demand":round(_predict_row(model, f, float(latest.price), int(latest.promo)),1),"elasticity":round(e.elasticity,2),"elasticity_confidence":e.confidence,"elasticity_r2":round(e.r2,3),"inventory":int(latest.inventory)})
    return {"products":rows}

@app.get("/products/{product_id}")
def product(product_id: str, store_id: str="STORE-001"):
    raw, featured, model = _load(); row, history = _latest(raw, featured, product_id, store_id); e=estimate_elasticity(raw, product_id, store_id)
    return {"product_id":product_id,"product_name":row.product_name,"category":row.category,"store_id":store_id,"store_name":row.store_name,"current_price":float(row.price),"cost":float(row.cost),"promo":int(row.promo),"inventory":int(row.inventory),"elasticity":e.__dict__,"promotion_uplift":promotion_uplift(raw,product_id,store_id),"recent_demand":history[["date","units_sold"]].tail(30).to_dict("records")}

@app.post("/pricing/recommend")
def recommend(req: PricingRequest):
    raw, featured, model = _load(); row,e,best,scenarios,interval,confidence,review,explanation,price_impact = _decision(raw,featured,model,req)
    return {"product":{"product_id":req.product_id,"product_name":row.product_name,"category":row.category,"store_id":req.store_id,"store_name":row.store_name},"recommendation":{**best.__dict__,"price_change_pct":best.price_change_pct,"demand_interval":interval,"confidence":confidence,"review_required":review,"elasticity":e.elasticity,"elasticity_confidence":e.confidence,"price_impact_pct":price_impact},"scenarios":[s.__dict__ for s in scenarios],"explanation":explanation,"guardrails":{"min_margin":req.min_margin,"max_price_change":req.max_price_change}}

@app.post("/pricing/simulate")
def simulate(req: SimulationRequest):
    return recommend(req)

@app.get("/dashboard/summary")
def dashboard_summary():
    raw, featured, model = _load()
    latest_date=raw.date.max(); recent=raw[raw.date >= latest_date-pd.Timedelta(value=29, unit="D")]
    daily=recent.groupby("date",as_index=False).agg(units_sold=("units_sold","sum"), revenue=("revenue","sum"), gross_profit=("gross_profit","sum"))
    prod = products()["products"]
    scores = [drift_score(raw["units_sold"].tail(90), raw["units_sold"].head(90))]
    return {"daily":daily.to_dict("records"),"products":prod,"kpis":{"revenue":float(recent.revenue.sum()),"units":int(recent.units_sold.sum()),"gross_profit":float(recent.gross_profit.sum()),"sku_count":len(prod)},"monitoring":{"demand_drift_score":round(scores[0],3),"demand_drift_state":drift_state(scores[0])},"model":{"artifact":MODEL_PATH.exists(),"evaluation":json.loads(EVAL_PATH.read_text(encoding="utf-8")) if EVAL_PATH.exists() else {}}}
