from pathlib import Path
import numpy as np
import pandas as pd
from metron.catalog import PRODUCT_NAMES

CATEGORIES = ["Dairy", "Beverage", "Bakery", "Produce", "Snacks", "Frozen"]

def main():
    rng = np.random.default_rng(42)
    dates = pd.date_range("2025-01-01", periods=365, freq="D")
    products = list(PRODUCT_NAMES)
    stores = [f"STORE-{i:03d}" for i in range(1, 6)]
    rows = []
    for pi, product in enumerate(products):
        category = CATEGORIES[pi % len(CATEGORIES)]
        base = 1.8 + (pi % 10) * .58
        cost = base * rng.uniform(.48, .72)
        for si, store in enumerate(stores):
            for di, date in enumerate(dates):
                season = 1 + .12*np.sin(2*np.pi*di/365)
                weekend = 1.12 if date.dayofweek >= 5 else 1.0
                promo = int(rng.random() < .13)
                price = base*(.92 if promo else 1.0)*(1+rng.normal(0,.015))
                latent = 85 + pi*1.7 + si*4
                demand = latent*season*weekend*(price/base)**-1.25*(1.25 if promo else 1.0)
                units = max(0, int(rng.poisson(max(2,demand))))
                inventory = max(0, int(rng.normal(units*5 + 60, 25)))
                rows.append([date, product, PRODUCT_NAMES[product], store, f"Store {si+1:03d}", category, price, cost, promo, inventory, units, price*units, (price-cost)*units])
    out = pd.DataFrame(rows, columns=["date","product_id","product_name","store_id","store_name","category","price","cost","promo","inventory","units_sold","revenue","gross_profit"])
    Path("data/raw").mkdir(parents=True, exist_ok=True)
    out.to_csv("data/raw/demo_retail.csv", index=False)
    print(f"Wrote {len(out):,} rows to data/raw/demo_retail.csv")
if __name__ == "__main__": main()
