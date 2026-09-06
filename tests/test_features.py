import pandas as pd
from metron.features import build_features

def test_feature_builder():
    dates = pd.date_range("2025-01-01", periods=10)
    df = pd.DataFrame({
        "date":dates,"product_id":["A"]*10,"store_id":["S1"]*10,
        "category":["Dairy"]*10,"price":[2.0]*10,"cost":[1.0]*10,
        "promo":[0]*10,"units_sold":list(range(10))
    })
    out = build_features(df)
    assert "lag_1" in out.columns
    assert "rolling_7" in out.columns
    assert len(out) > 0
