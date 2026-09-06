from metron.pricing import optimize_price

def test_optimizer():
    best, scenarios = optimize_price(10, 5, lambda p: 100*(p/10)**-1.2)
    assert scenarios
    assert best.price > 0
    assert best.expected_demand >= 0
