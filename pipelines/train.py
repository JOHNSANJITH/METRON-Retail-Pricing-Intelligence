from pathlib import Path
import json
import pandas as pd
import joblib
from metron.io import load_csv
from metron.features import build_features
from metron.forecasting import train

def main():
    df = build_features(load_csv("data/raw/demo_retail.csv"))
    cutoff = df["date"].max() - pd.Timedelta(value=28, unit="D")
    train_df = df[df["date"] <= cutoff].dropna(subset=["lag_1","lag_7","rolling_7","rolling_28"])
    model = train(train_df)
    Path("models").mkdir(exist_ok=True); joblib.dump(model, "models/demand_model.joblib")
    Path("artifacts").mkdir(exist_ok=True)
    Path("artifacts/training_summary.json").write_text(json.dumps({"rows": len(train_df), "cutoff": str(cutoff.date()), "features": model.pipeline.named_steps["pre"].get_feature_names_out().tolist()}, indent=2), encoding="utf-8")
    print("Saved models/demand_model.joblib")
if __name__ == "__main__": main()
