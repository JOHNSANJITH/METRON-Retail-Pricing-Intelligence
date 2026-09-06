from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_products_endpoint():
    response = client.get("/products")
    assert response.status_code == 200
    assert len(response.json()["products"]) >= 30
    assert "product_name" in response.json()["products"][0]

def test_pricing_recommendation():
    response = client.post("/pricing/recommend", json={"product_id":"SKU-0001","store_id":"STORE-001","current_price":1.80,"cost":1.20,"objective":"profit"})
    assert response.status_code == 200
    body = response.json()
    assert body["recommendation"]["price"] > 0
    assert len(body["scenarios"]) > 0
