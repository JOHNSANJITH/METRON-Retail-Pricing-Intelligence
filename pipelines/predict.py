import joblib
import pandas as pd
from metron.io import load_csv
from metron.features import build_features
from metron.forecasting import predict

df = build_features(load_csv("data/raw/demo_retail.csv")).dropna()
model = joblib.load("models/demand_model.joblib")
out = df[["date","product_id","store_id","product_name","price"]].copy()
out["forecast_demand"] = predict(model, df)
out.to_csv("data/processed/predictions.csv", index=False)
print(f"Wrote {len(out):,} predictions")
