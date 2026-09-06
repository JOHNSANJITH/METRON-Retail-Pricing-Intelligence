import pandas as pd

REQUIRED = ["date", "product_id", "store_id", "category", "price", "cost", "promo", "units_sold"]

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    out = df.copy()
    out["date"] = pd.to_datetime(out["date"])
    out = out.sort_values(["product_id", "store_id", "date"]).reset_index(drop=True)
    group = out.groupby(["product_id", "store_id"], group_keys=False)["units_sold"]
    out["lag_1"] = group.shift(1)
    out["lag_7"] = group.shift(7)
    out["rolling_7"] = group.transform(lambda s: s.shift(1).rolling(7, min_periods=1).mean())
    out["rolling_28"] = group.transform(lambda s: s.shift(1).rolling(28, min_periods=1).mean())
    out["day_of_week"] = out.date.dt.dayofweek
    out["month"] = out.date.dt.month
    out["week_of_year"] = out.date.dt.isocalendar().week.astype(int)
    numeric = ["lag_1", "lag_7", "rolling_7", "rolling_28"]
    out[numeric] = out.groupby(["product_id", "store_id"])[numeric].transform(lambda x: x.bfill().ffill())
    return out
