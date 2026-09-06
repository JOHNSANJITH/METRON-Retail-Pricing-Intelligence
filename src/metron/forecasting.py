from dataclasses import dataclass
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, FunctionTransformer

FEATURES = ["price","promo","lag_1","lag_7","rolling_7","rolling_28","day_of_week","month","week_of_year","product_id","store_id","category"]
@dataclass
class ForecastModel:
    pipeline: Pipeline

def _dense(X):
    return X.toarray() if hasattr(X, "toarray") else X

def build_model():
    categorical = ["product_id","store_id","category"]
    numeric = [c for c in FEATURES if c not in categorical]
    pre = ColumnTransformer([
        ("num", "passthrough", numeric),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical),
    ], sparse_threshold=0)
    model = HistGradientBoostingRegressor(max_iter=180, learning_rate=.06, max_leaf_nodes=31, random_state=42)
    return ForecastModel(Pipeline([("pre", pre), ("dense", FunctionTransformer(_dense, accept_sparse=True)), ("model", model)]))

def train(df):
    model = build_model(); model.pipeline.fit(df[FEATURES], df["units_sold"]); return model

def predict(model, df):
    return model.pipeline.predict(df[FEATURES])
