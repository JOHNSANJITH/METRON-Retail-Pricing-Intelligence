from dataclasses import dataclass
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

@dataclass(frozen=True)
class ElasticityEstimate:
    elasticity: float
    confidence: str
    observations: int
    r2: float
    level: str


def estimate_elasticity(df: pd.DataFrame, product_id: str, store_id: str | None = None) -> ElasticityEstimate:
    x = df[df.product_id == product_id].copy()
    if store_id:
        x = x[x.store_id == store_id]
    x = x[(x.price > 0) & (x.units_sold > 0)].copy()
    if len(x) < 30 or x.price.nunique() < 8:
        return ElasticityEstimate(-1.0, "Low", len(x), 0.0, "insufficient-data")
    x["date"] = pd.to_datetime(x["date"])
    doy = x.date.dt.dayofyear.to_numpy()
    dow = x.date.dt.dayofweek.to_numpy()
    X = np.column_stack([
        np.log(x.price.to_numpy()),
        x.promo.to_numpy(),
        np.sin(2*np.pi*doy/365),
        np.cos(2*np.pi*doy/365),
        (dow >= 5).astype(int),
    ])
    y = np.log(x.units_sold.to_numpy())
    model = LinearRegression().fit(X, y)
    e = float(np.clip(model.coef_[0], -4.0, 0.5))
    r2 = float(max(0.0, model.score(X, y)))
    confidence = "High" if len(x) >= 180 and r2 >= .20 else "Medium" if len(x) >= 60 else "Low"
    level = "elastic" if e < -1.05 else "unit-elastic" if e <= -.95 else "inelastic"
    return ElasticityEstimate(e, confidence, len(x), r2, level)


def promotion_uplift(df: pd.DataFrame, product_id: str, store_id: str | None = None) -> float:
    x = df[df.product_id == product_id].copy()
    if store_id:
        x = x[x.store_id == store_id]
    if x.empty: return 0.0
    promo, base = x[x.promo == 1].units_sold, x[x.promo == 0].units_sold
    if len(promo) < 5 or len(base) < 10 or base.mean() <= 0: return 0.0
    return float(np.clip(promo.mean()/base.mean()-1.0, -.5, 2.0))
