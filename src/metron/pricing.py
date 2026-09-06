from dataclasses import dataclass
import numpy as np

@dataclass(frozen=True)
class PriceScenario:
    price: float
    expected_demand: float
    expected_revenue: float
    expected_profit: float
    margin: float
    price_change_pct: float
    feasible: bool = True


def optimize_price(current_price, cost, demand_fn, *, objective="profit", min_multiplier=.90,
                   max_multiplier=1.10, step=None, min_margin=.05, rounding=.01):
    if current_price <= 0 or cost < 0:
        raise ValueError("Invalid price/cost")
    floor = cost / max(1 - min_margin, 1e-9)
    low = max(floor, current_price * min_multiplier)
    high = current_price * max_multiplier
    if low > high:
        raise ValueError("Constraints leave no feasible price")
    step = step or max(current_price * .01, rounding)
    raw = np.arange(low, high + step / 2, step)
    prices = sorted(set(round(float(np.clip(p, low, high)) / rounding) * rounding for p in raw))
    if round(high / rounding) * rounding not in prices:
        prices.append(round(high / rounding) * rounding)
    scenarios = []
    for price in prices:
        if price < floor - 1e-9:
            continue
        demand = max(0.0, float(demand_fn(float(price))))
        revenue = float(price * demand)
        profit = float((price - cost) * demand)
        margin = float((price - cost) / price) if price else 0.0
        change = float((price / current_price - 1) * 100)
        scenarios.append(PriceScenario(float(price), demand, revenue, profit, margin, change))
    key = (lambda s: s.expected_revenue) if objective == "revenue" else (lambda s: s.expected_profit)
    return max(scenarios, key=key), scenarios
