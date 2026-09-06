import json
import pandas as pd
import joblib
from metron.io import load_csv
from metron.features import build_features
from metron.forecasting import predict
from metron.evaluation import regression_metrics

def main():
    df = build_features(load_csv("data/raw/demo_retail.csv"))
    cutoff = df["date"].max() - pd.Timedelta(value=28, unit="D")
    test = df[df["date"] > cutoff].dropna(subset=["lag_1","lag_7","rolling_7","rolling_28"])
    model = joblib.load("models/demand_model.joblib")
    metrics = regression_metrics(test["units_sold"], predict(model, test))
    print(metrics)
    open("artifacts/evaluation.json", "w", encoding="utf-8").write(json.dumps(metrics, indent=2))
if __name__ == "__main__": main()
