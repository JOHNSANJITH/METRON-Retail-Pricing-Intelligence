import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const navItems = [
  ["overview", "Overview", "grid"],
  ["pricing", "Pricing Lab", "sliders"],
  ["demand", "Demand", "trend"],
  ["elasticity", "Elasticity", "target"],
  ["products", "Products", "box"],
  ["health", "Model Health", "shield"],
];

function Icon({ name, size = 18 }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const s = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),

    sliders: (
      <>
        <line x1="4" y1="6" x2="20" y2="6" />
        <circle cx="9" cy="6" r="2" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <circle cx="15" cy="12" r="2" />
        <line x1="4" y1="18" x2="20" y2="18" />
        <circle cx="11" cy="18" r="2" />
      </>
    ),

    trend: (
      <>
        <polyline points="3 17 8 12 12 15 21 6" />
        <polyline points="15 6 21 6 21 12" />
      </>
    ),

    target: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3l7 3v5c0 4.6-3 7.8-7 10-4-2.2-7-5.4-7-10V6l7-3z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),

    box: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    warning: (
      <>
        <path d="M12 3 21 19H3L12 3z" />
        <path d="M12 9v4" />
        <path d="M12 16h.01" />
      </>
    ),

    check: <path d="m5 12 4 4L19 6" />,
  };

  return <svg {...p}>{s[name] || s.grid}</svg>;
}

const money = (v, d = 0) =>
  Number.isFinite(Number(v))
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: d,
      }).format(Number(v))
    : "—";

const num = (v, d = 0) =>
  Number.isFinite(Number(v)) ? Number(v).toFixed(d) : "—";

// Presentation policy: keep model calculations at full precision,
// but display decision metrics at a human-readable precision.

function normalizeProductsResponse(payload) {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const directKeys = [
    "products",
    "items",
    "data",
    "rows",
    "results",
  ];

  for (const key of directKeys) {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      const nested = normalizeProductsResponse(value);
      if (nested.length) return nested;
    }
  }

  // Last-resort recursive search for an array containing product rows.
  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) {
      const productRows = value.filter(
        (row) =>
          row &&
          typeof row === "object" &&
          ("product_id" in row || "sku" in row)
      );

      if (productRows.length) {
        return productRows;
      }
    }

    if (value && typeof value === "object") {
      const nested = normalizeProductsResponse(value);
      if (nested.length) return nested;
    }
  }

  return [];
}

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function CardTitle({ title, sub }) {
  return (
    <div>
      <div className="card-title">{title}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );
}

function Header({ eyebrow, title, subtitle, action }) {
  return (
    <div className="view-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function LineChart({
  data,
  series,
  xKey = "date",
  prefix = "",
  suffix = "",
}) {
  if (!data?.length) {
    return <div className="empty-chart">No chart data available.</div>;
  }

  const W = 920;
  const H = 300;
  const P = 32;

  const all = series.flatMap((k) =>
    data.map((d) => Number(d[k]) || 0)
  );

  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = Math.max(max - min, 1);

  const points = (k) =>
    data
      .map(
        (d, i) =>
          `${P + (i * (W - 2 * P)) / Math.max(data.length - 1, 1)},${
            H -
            P -
            ((Number(d[k]) - min) / range) * (H - 2 * P)
          }`
      )
      .join(" ");

  return (
    <div className="chart-box">
      <div className="chart-meta">
        {series.map((k, i) => (
          <span key={k}>
            <i className={`legend ${i === 0 ? "purple" : "gray"}`} />
            {k}
          </span>
        ))}

        <span className="chart-range">
          {data[0][xKey]} — {data[data.length - 1][xKey]}
        </span>
      </div>

      <svg
        className="trend-chart"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        {[0.2, 0.45, 0.7].map((r) => (
          <line
            key={r}
            x1={P}
            x2={W - P}
            y1={H - P - r * (H - 2 * P)}
            y2={H - P - r * (H - 2 * P)}
            className="grid-line"
          />
        ))}

        {series.map((k, i) => (
          <polyline
            key={k}
            points={points(k)}
            className={i === 0 ? "main-line" : "forecast-line"}
          />
        ))}
      </svg>

      <div className="axis">
        <span>
          {prefix}
          {num(min)}
          {suffix}
        </span>

        <span>
          {prefix}
          {num((min + max) / 2)}
          {suffix}
        </span>

        <span>
          {prefix}
          {num(max)}
          {suffix}
        </span>
      </div>
    </div>
  );
}

function ScenarioChart({ scenarios, objective, compact = false }) {
  if (!scenarios?.length) {
    return (
      <div className="empty-chart">
        Run the simulator to generate the scenario frontier.
      </div>
    );
  }

  const W = 920;
  const H = compact ? 210 : 320;
  const P = compact ? 30 : 42;

  const values = scenarios.map((s) =>
    Number(
      objective === "profit"
        ? s.expected_profit
        : s.expected_revenue
    )
  );

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const bestIndex = values.indexOf(Math.max(...values));

  const pts = values
    .map(
      (v, i) =>
        `${P + (i * (W - 2 * P)) / Math.max(values.length - 1, 1)},${
          H -
          P -
          ((v - min) / range) * (H - 2 * P)
        }`
    )
    .join(" ");

  const bx =
    P +
    (bestIndex * (W - 2 * P)) /
      Math.max(values.length - 1, 1);

  const by =
    H -
    P -
    ((values[bestIndex] - min) / range) *
      (H - 2 * P);

  return (
    <div className="chart-box">
      <div className="chart-meta">
        <span>
          <i className="legend purple" />
          {objective === "profit"
            ? "Expected profit"
            : "Expected revenue"}
        </span>

        <span className="chart-range">
          {money(scenarios[0].price, 2)} —{" "}
          {money(scenarios.at(-1).price, 2)}
        </span>
      </div>

      <svg
        className={`trend-chart scenario-svg ${compact ? "scenario-svg-compact" : ""}`}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        {[0.2, 0.45, 0.7].map((r) => (
          <line
            key={r}
            x1={P}
            x2={W - P}
            y1={H - P - r * (H - 2 * P)}
            y2={H - P - r * (H - 2 * P)}
            className="grid-line"
          />
        ))}

        <polyline
          points={pts}
          className="main-line"
        />

        <circle
          cx={bx}
          cy={by}
          r="6"
          className="best-point"
        />
      </svg>

      <div className="axis">
        <span>{money(scenarios[0].price, 2)}</span>

        <span>
          {money(
            scenarios[Math.floor(scenarios.length / 2)].price,
            2
          )}
        </span>

        <span>
          {money(scenarios.at(-1).price, 2)}
        </span>
      </div>
    </div>
  );
}

function PriceInput({ label, value, onChange }) {
  const formatValue = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : "";
  };

  const [text, setText] = useState(formatValue(value));

  useEffect(() => {
    setText(formatValue(value));
  }, [value]);

  return (
    <label>
      {label}

      <input
        inputMode="decimal"
        type="text"
        value={text}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9.]/g, "");
          setText(v);
        }}
        onBlur={() => {
          const n = Number(text);

          if (Number.isFinite(n) && n > 0) {
            onChange(n);
            setText(String(n));
          } else {
            setText(String(value));
          }
        }}
      />
    </label>
  );
}

function App() {
  const [view, setView] = useState("overview");

  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);

  const [productId, setProductId] = useState("SKU-0001");
  const [storeId, setStoreId] = useState("STORE-001");

  const [productDetail, setProductDetail] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState("Starting services");
  const [scenarioLoading, setScenarioLoading] = useState(false);

  const [objective, setObjective] = useState("profit");

  const [currentPrice, setCurrentPrice] = useState(10);
  const [cost, setCost] = useState(5);

  const [maxChange, setMaxChange] = useState(10);
  const [promo, setPromo] = useState(0);

  const refresh = async () => {
    setLoading(true);
    setLoadingStage("Starting services");
    setApiError("");

    try {
      setLoadingStage("Checking API and model");

      const healthResponse = await fetch(`${API}/health`, {
        cache: "no-store",
      });

      if (!healthResponse.ok) {
        throw new Error(
          `Health check failed: ${healthResponse.status}`
        );
      }

      const healthData = await healthResponse.json();
      setHealth(healthData);

      setLoadingStage("Loading commercial data");

      const summaryResponse = await fetch(
        `${API}/dashboard/summary`,
        { cache: "no-store" }
      );

      if (!summaryResponse.ok) {
        throw new Error(
          `Dashboard summary failed: ${summaryResponse.status}`
        );
      }

      const summaryData = await summaryResponse.json();
      setSummary(summaryData);

      setLoadingStage("Loading product catalog");

      const productsResponse = await fetch(
        `${API}/products`,
        { cache: "no-store" }
      );

      if (!productsResponse.ok) {
        throw new Error(
          `Products request failed: ${productsResponse.status}`
        );
      }

      const productsData = await productsResponse.json();
      const productRows = normalizeProductsResponse(productsData);
      setProducts(productRows);

      // Load the default product detail before declaring the dashboard ready.
      const initialProduct =
        productRows.find(
          (p) =>
            p.product_id === productId &&
            p.store_id === storeId
        ) || productRows.find((p) => p.product_id === productId);

      if (initialProduct) {
        setLoadingStage("Warming up product intelligence");

        setStoreId(initialProduct.store_id);
        setCurrentPrice(Number(initialProduct.current_price));
        setCost(Number(initialProduct.cost));

        const detailResponse = await fetch(
          `${API}/products/${initialProduct.product_id}?store_id=${initialProduct.store_id}`,
          { cache: "no-store" }
        );

        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          setProductDetail(detailData);
        }
      }

      setLoadingStage("Ready");
    } catch (e) {
      console.error("METRON API error:", e);
      setApiError(
        e?.message || "Unable to connect to METRON API"
      );
      setLoadingStage("Connection issue");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (loading || !products.length) return;

    const p =
      products.find(
        (x) =>
          x.product_id === productId &&
          x.store_id === storeId
      ) ||
      products.find(
        (x) => x.product_id === productId
      );

    if (!p) return;

    setStoreId(p.store_id);
    setCurrentPrice(Number(p.current_price));
    setCost(Number(p.cost));

    fetch(
      `${API}/products/${p.product_id}?store_id=${p.store_id}`,
      { cache: "no-store" }
    )
      .then((r) => {
        if (!r.ok) throw new Error("Product detail request failed");
        return r.json();
      })
      .then(setProductDetail)
      .catch((e) => console.warn("Product detail unavailable:", e));
  }, [productId, storeId, products, loading]);

  const run = async () => {
    setScenarioLoading(true);
    setApiError("");

    try {
      const r = await fetch(`${API}/pricing/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          store_id: storeId,
          current_price: currentPrice,
          cost,
          promo,
          objective,
          max_price_change: maxChange / 100,
          min_margin: 0.05,
        }),
      });

      if (!r.ok) {
        throw new Error(await r.text());
      }

      setRecommendation(await r.json());
      setView("pricing");
    } catch (e) {
      setApiError(e.message);
    } finally {
      setScenarioLoading(false);
    }
  };

  /*
   * IMPORTANT FIX:
   *
   * The backend summary returns:
   *
   * model: {
   *   artifact: true,
   *   evaluation: {...}
   * }
   *
   * Some backend versions may also return:
   *
   * health.model_available
   *
   * Therefore we support BOTH.
   */
  const modelAvailable =
    health?.model_available ??
    summary?.model?.artifact ??
    false;

  const selected =
    products.find(
      (p) =>
        p.product_id === productId &&
        p.store_id === storeId
    ) ||
    products.find(
      (p) => p.product_id === productId
    );

  const daily = summary?.daily || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">M</div>

          <div>
            <div className="brand-name">METRON</div>
            <div className="brand-sub">
              Retail intelligence
            </div>
          </div>
        </div>

        <div className="sidebar-rule" />

        <div className="nav-caption">
          WORKSPACE
        </div>

        <nav>
          {navItems.map(([id, label, icon]) => (
            <button
              key={id}
              className={`nav-item ${
                view === id ? "active" : ""
              }`}
              onClick={() => setView(id)}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="status-label">
            SYSTEM STATUS
          </div>

          <div
            className={`status-card ${
              modelAvailable ? "online" : ""
            }`}
          >
            <span className="status-dot" />

            <div>
              <strong>
                {modelAvailable
                  ? "Core services online"
                  : loading
                  ? "Checking services"
                  : "Model unavailable"}
              </strong>

              <small>
                {modelAvailable
                  ? "API + model available"
                  : "Check the API service"}
              </small>
            </div>
          </div>

          <div className="build">
            METRON / 2.0.0
            <br />
            LOCAL DEVELOPMENT
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <span>METRON</span>

            <Icon name="arrow" size={13} />

            <strong>
              {navItems.find(
                (n) => n[0] === view
              )?.[1]}
            </strong>
          </div>

          <div className="top-actions">
            <span className={`live ${loading ? "warming" : "ready"}`}>
              <i /> {loading ? "WARMING UP" : "LIVE"}
            </span>
          </div>
        </header>

        {apiError && (
          <div className="error-banner">
            <Icon name="warning" size={16} />
            <span>{apiError}</span>
          </div>
        )}

        {view === "overview" && (
          <>
            <Header
              eyebrow="RETAIL PRICING INTELLIGENCE"
              title="Make the pricing decision defensible."
              subtitle="Forecast demand, understand price response, simulate scenarios, and surface a constrained recommendation."
              action={
                <button
                  className="primary-button"
                  onClick={() => setView("pricing")}
                >
                  Open Pricing Lab
                  <Icon name="arrow" size={16} />
                </button>
              }
            />

            <div className="metric-grid">
              <Metric
                label="Demand model"
                value={
                  modelAvailable
                    ? "Ready"
                    : "Offline"
                }
                detail="Trained artifact"
              />

              <Metric
                label="Products"
                value={
                  summary?.kpis?.sku_count ?? "—"
                }
                detail="Catalog coverage"
              />

              <Metric
                label="Gross profit"
                value={
                  summary?.kpis
                    ? money(
                        summary.kpis.gross_profit
                      )
                    : "—"
                }
                detail="Last 30 days"
              />

              <Metric
                label="Decision state"
                value={
                  recommendation
                    ? "Updated"
                    : "Ready"
                }
                detail="Product-level simulation"
              />
            </div>

            <div className="content-grid main-grid">
              <Card className="chart-card">
                <div className="card-head">
                  <CardTitle
                    title="Commercial trajectory"
                    sub="Actual demo sales signal from the retail dataset."
                  />

                  <span className="tag">
                    SYNTHETIC DATA
                  </span>
                </div>

                <div className="chart-stack">
                  <LineChart
                    data={daily}
                    series={["revenue"]}
                  />

                  <LineChart
                    data={daily}
                    series={["units_sold"]}
                  />
                </div>
              </Card>

              <Card className="decision-card">
                <CardTitle
                  title="Current decision"
                  sub={
                    selected?.product_name ||
                    "Select a product"
                  }
                />

                <div className="decision-big">
                  {recommendation
                    ? money(
                        recommendation
                          .recommendation.price,
                        2
                      )
                    : "—"}
                </div>

                <div className="decision-label">
                  Recommended price
                </div>

                <div className="decision-lines">
                  <div>
                    <span>Current</span>
                    <strong>
                      {money(currentPrice, 2)}
                    </strong>
                  </div>

                  <div>
                    <span>Elasticity</span>
                    <strong>
                      {num(selected?.elasticity, 2)}
                    </strong>
                  </div>

                  <div>
                    <span>Confidence</span>
                    <strong>
                      {recommendation
                        ?.recommendation
                        ?.confidence ||
                        selected?.elasticity_confidence ||
                        "Pending"}
                    </strong>
                  </div>
                </div>

                <button
                  className="text-button"
                  onClick={() =>
                    setView("pricing")
                  }
                >
                  Explore decision
                  <Icon
                    name="arrow"
                    size={14}
                  />
                </button>
              </Card>
            </div>

            <div className="content-grid three-grid">
              <Card>
                <CardTitle
                  title="Product intelligence"
                  sub="Selected SKU"
                />

                <div className="mini-value">
                  {selected?.product_name || "—"}
                </div>

                <div className="mini-delta">
                  {selected?.category || ""} ·{" "}
                  {selected?.product_id || ""}
                </div>
              </Card>

              <Card>
                <CardTitle
                  title="Price sensitivity"
                  sub="Observed response estimate"
                />

                <div className="mini-value">
                  {num(selected?.elasticity, 2)}
                </div>

                <div className="mini-delta">
                  {selected?.elasticity_confidence ||
                    "Pending"}{" "}
                  confidence
                </div>
              </Card>

              <Card>
                <CardTitle
                  title="Monitoring"
                  sub="Demand distribution shift"
                />

                <div className="mini-value">
                  {summary?.monitoring
                    ?.demand_drift_state || "—"}
                </div>

                <div className="mini-delta">
                  score{" "}
                  {num(summary?.monitoring?.demand_drift_score, 2)}
                </div>
              </Card>
            </div>
          </>
        )}

        {view === "pricing" && (
          <PricingLab
            {...{
              products,
              productId,
              setProductId,
              storeId,
              setStoreId,
              currentPrice,
              setCurrentPrice,
              cost,
              setCost,
              objective,
              setObjective,
              maxChange,
              setMaxChange,
              promo,
              setPromo,
              run,
              scenarioLoading,
              recommendation,
              selected,
            }}
          />
        )}

        {view === "demand" && (
          <>
            <Header
              eyebrow="DEMAND INTELLIGENCE"
              title="Forecast the commercial signal."
              subtitle="Use the trained demand model and recent observations as the basis for product decisions."
            />

            <div className="content-grid main-grid">
              <Card className="chart-card">
                <CardTitle
                  title="30-day demand and revenue"
                  sub="Aggregated development dataset."
                />

                <div className="chart-stack">
                  <LineChart
                    data={daily}
                    series={["revenue"]}
                  />

                  <LineChart
                    data={daily}
                    series={["units_sold"]}
                  />
                </div>
              </Card>

              <Card>
                <CardTitle
                  title="Selected product"
                  sub={selected?.product_name}
                />

                <div className="feature-list">
                  <Feature
                    name="Forecast demand"
                    value={
                      selected?.forecast_demand ??
                      "—"
                    }
                  />

                  <Feature
                    name="Inventory"
                    value={
                      selected?.inventory ?? "—"
                    }
                  />

                  <Feature
                    name="Category"
                    value={
                      selected?.category ?? "—"
                    }
                  />

                  <Feature
                    name="Elasticity"
                    value={
                      selected?.elasticity ?? "—"
                    }
                  />

                  <Feature
                    name="Confidence"
                    value={
                      selected?.elasticity_confidence ??
                      "—"
                    }
                  />
                </div>
              </Card>
            </div>
          </>
        )}

        {view === "elasticity" && (
          <>
            <Header
              eyebrow="PRICE RESPONSE"
              title="Understand each product's sensitivity."
              subtitle="Elasticity is estimated from observed price variation for the selected SKU and store."
            />

            <Card className="elasticity-card">
              <div className="card-head">
                <CardTitle
                  title={
                    productDetail?.product_name ||
                    selected?.product_name ||
                    "Product"
                  }
                  sub={`${productId} · ${storeId}`}
                />

                <div className="elasticity-number">
                  {num(
                    productDetail?.elasticity?.elasticity ??
                    selected?.elasticity,
                    2
                  )}
                </div>
              </div>

              <div className="content-grid two-grid">
                <Card>
                  <div className="feature-list">
                    <Feature
                      name="Elasticity"
                      value={num(productDetail?.elasticity?.elasticity, 2)}
                    />

                    <Feature
                      name="Confidence"
                      value={
                        productDetail
                          ?.elasticity?.confidence ??
                        "—"
                      }
                    />

                    <Feature
                      name="Observations"
                      value={
                        productDetail
                          ?.elasticity
                          ?.observations ?? "—"
                      }
                    />

                    <Feature
                      name="R²"
                      value={num(productDetail?.elasticity?.r2, 2)}
                    />

                    <Feature
                      name="Promotion uplift"
                      value={
                        productDetail
                          ? `${num(
                              productDetail.promotion_uplift *
                                100,
                              1
                            )}%`
                          : "—"
                      }
                    />
                  </div>
                </Card>

                <Card>
                  <CardTitle
                    title="Interpretation"
                    sub="Model-derived diagnostic"
                  />

                  <div className="mini-value">
                    {productDetail?.elasticity
                      ?.level || "—"}
                  </div>

                  <div className="mini-delta">
                    Price response varies by
                    product; low-confidence
                    estimates should route to
                    human review.
                  </div>
                </Card>
              </div>
            </Card>
          </>
        )}

        {view === "products" && (
          <>
            <Header
              eyebrow="PRODUCT PORTFOLIO"
              title="Price every product on its own evidence."
              subtitle="Select a SKU, inspect its model signals, then simulate a product-specific pricing decision."
            />

            <Card className="table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Demand</th>
                      <th>Elasticity</th>
                      <th>Confidence</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products
                      .filter(
                        (p, i, a) =>
                          a.findIndex(
                            (x) =>
                              x.product_id ===
                              p.product_id
                          ) === i
                      )
                      .map((p) => (
                        <tr
                          key={`${p.product_id}-${p.store_id}`}
                        >
                          <td>
                            {p.product_name}
                          </td>

                          <td className="mono">
                            {p.product_id}
                          </td>

                          <td>{p.category}</td>

                          <td>
                            {money(
                              p.current_price,
                              2
                            )}
                          </td>

                          <td>
                            {num(
                              p.forecast_demand
                            )}
                          </td>

                          <td>
                            {num(
                              p.elasticity,
                              2
                            )}
                          </td>

                          <td>
                            {
                              p.elasticity_confidence
                            }
                          </td>

                          <td>
                            <button
                              className="small-button"
                              onClick={() => {
                                setProductId(
                                  p.product_id
                                );
                                setStoreId(
                                  p.store_id
                                );
                                setView("pricing");
                              }}
                            >
                              Simulate
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {view === "health" && (
          <>
            <Header
              eyebrow="MODEL HEALTH"
              title="Know what is running."
              subtitle="Operational status, evaluation quality, drift monitoring, and decision safeguards."
            />

            <div className="content-grid three-grid">
              <HealthCard
                title="API service"
                value={
                  health?.status === "ok"
                    ? "PASS"
                    : "FAIL"
                }
                sub="FastAPI"
                ok={health?.status === "ok"}
              />

              <HealthCard
                title="Demand model"
                value={
                  modelAvailable
                    ? "PASS"
                    : "FAIL"
                }
                sub="Joblib artifact"
                ok={modelAvailable}
              />

              <HealthCard
                title="Tests"
                value="3+"
                sub="Automated quality gates"
                ok
              />
            </div>

            <div className="content-grid two-grid">
              <Card>
                <CardTitle
                  title="Evaluation"
                  sub="Held-out final 28 days of synthetic data"
                />

                <div className="feature-list">
                  <Feature
                    name="MAE"
                    value={
                      health?.evaluation?.mae?.toFixed(
                        2
                      ) || "—"
                    }
                  />

                  <Feature
                    name="RMSE"
                    value={
                      health?.evaluation?.rmse?.toFixed(
                        2
                      ) || "—"
                    }
                  />

                  <Feature
                    name="WAPE"
                    value={
                      health?.evaluation?.wape
                        ? `${(
                            health.evaluation
                              .wape * 100
                          ).toFixed(2)}%`
                        : "—"
                    }
                  />
                </div>
              </Card>

              <Card>
                <CardTitle
                  title="Monitoring"
                  sub="Development drift check"
                />

                <div className="mini-value">
                  {summary?.monitoring
                    ?.demand_drift_state || "—"}
                </div>

                <div className="mini-delta">
                  Score{" "}
                  {num(summary?.monitoring?.demand_drift_score, 2)}
                </div>
              </Card>
            </div>
          </>
        )}

        <footer>
          METRON · RETAIL PRICING INTELLIGENCE
          <span>
            DEVELOPMENT BUILD · SYNTHETIC DATA
          </span>
        </footer>
      </main>
    </div>
  );
}

function PricingLab(p) {
  const scenarios =
    p.recommendation?.scenarios || [];

  const rec =
    p.recommendation?.recommendation;

  return (
    <>
      <Header
        eyebrow="PRICING DECISION LAB"
        title="Simulate the price before you ship it."
        subtitle="Every simulation is conditioned on a selected product and store, then evaluated against commercial guardrails."
      />

      <div className="content-grid pricing-grid">
        <Card className="controls-card">
          <CardTitle
            title="Product context"
            sub="The decision is product-specific."
          />

          <label>
            Product

            <select
              value={p.productId}
              onChange={(e) =>
                p.setProductId(
                  e.target.value
                )
              }
            >
              {p.products
                .filter(
                  (x, i, a) =>
                    a.findIndex(
                      (y) =>
                        y.product_id ===
                        x.product_id
                    ) === i
                )
                .map((x) => (
                  <option
                    key={x.product_id}
                    value={x.product_id}
                  >
                    {x.product_name} ·{" "}
                    {x.product_id}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Store

            <select
              value={p.storeId}
              onChange={(e) =>
                p.setStoreId(
                  e.target.value
                )
              }
            >
              {p.products
                .filter(
                  (x) =>
                    x.product_id ===
                    p.productId
                )
                .map((x) => (
                  <option
                    key={x.store_id}
                    value={x.store_id}
                  >
                    {x.store_name}
                  </option>
                ))}
            </select>
          </label>

          <div className="form-grid">
            <PriceInput
              label="Current price"
              value={p.currentPrice}
              onChange={p.setCurrentPrice}
            />

            <PriceInput
              label="Unit cost"
              value={p.cost}
              onChange={p.setCost}
            />
          </div>

          <label>
            Objective

            <select
              value={p.objective}
              onChange={(e) =>
                p.setObjective(
                  e.target.value
                )
              }
            >
              <option value="profit">
                Gross profit
              </option>

              <option value="revenue">
                Revenue
              </option>
            </select>
          </label>

          <label>
            Promotion

            <select
              value={p.promo}
              onChange={(e) =>
                p.setPromo(
                  Number(e.target.value)
                )
              }
            >
              <option value="0">
                No promotion
              </option>

              <option value="1">
                Promotion active
              </option>
            </select>
          </label>

          <div className="range-head">
            <label>
              Maximum price movement
            </label>

            <strong>
              ±{p.maxChange}%
            </strong>
          </div>

          <input
            className="range"
            type="range"
            min="2"
            max="30"
            value={p.maxChange}
            onChange={(e) =>
              p.setMaxChange(
                Number(e.target.value)
              )
            }
          />

          <div className="guardrail-box">
            <div>
              <Icon
                name="shield"
                size={15}
              />

              <span>
                Guardrails active
              </span>
            </div>

            <p>
              Margin floor, price
              movement, and candidate
              rounding are enforced by
              the pricing engine.
            </p>
          </div>

          <button
            className="primary-button full"
            onClick={p.run}
            disabled={p.scenarioLoading}
          >
            {p.scenarioLoading
              ? "Running simulation…"
              : "Run product simulation"}

            <Icon
              name="arrow"
              size={16}
            />
          </button>
        </Card>

        <Card className="recommendation-card">
          <div className="recommendation-top">
            <span className="tag">
              RECOMMENDATION
            </span>

            {rec && (
              <span className="live">
                <i /> CALCULATED
              </span>
            )}
          </div>

          <div className="product-kicker">
            {p.selected?.product_name ||
              p.productId}
          </div>

          <div className="recommendation-price">
            {rec
              ? money(rec.price, 2)
              : "—"}
          </div>

          <div className="recommendation-label">
            {rec
              ? `${num(
                  rec.price_change_pct,
                  1
                )}% from current`
              : "Run the simulator"}
          </div>

          <div className="rec-stats">
            <div>
              <span>Demand</span>

              <strong>
                {rec
                  ? num(
                      rec.expected_demand
                    )
                  : "—"}
              </strong>
            </div>

            <div>
              <span>Revenue</span>

              <strong>
                {rec
                  ? money(
                      rec.expected_revenue
                    )
                  : "—"}
              </strong>
            </div>

            <div>
              <span>Profit</span>

              <strong>
                {rec
                  ? money(
                      rec.expected_profit
                    )
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="confidence">
            <div>
              <span>
                Decision confidence
              </span>

              <strong>
                {rec?.confidence ||
                  "Pending"}
              </strong>
            </div>

            <div className="confidence-bar">
              <span
                style={{
                  width: rec
                    ? `${
                        rec.confidence ===
                        "High"
                          ? 88
                          : rec.confidence ===
                            "Medium"
                          ? 66
                          : 38
                      }%`
                    : "8%",
                }}
              />
            </div>
          </div>

          {rec && (
            <div className="review-note">
              {rec.review_required
                ? "Human review recommended before deployment."
                : "Within normal review policy."}
            </div>
          )}

          <div className="inline-scenario">
            <div className="inline-scenario-head">
              <div>
                <div className="inline-scenario-title">Scenario frontier</div>
                <div className="inline-scenario-sub">Expected commercial outcome across candidate prices.</div>
              </div>

              <span className="tag">
                {p.objective.toUpperCase()}
              </span>
            </div>

            <ScenarioChart
              scenarios={scenarios}
              objective={p.objective}
              compact
            />
          </div>
        </Card>
      </div>

      <Card className="scenario-card">
        <div className="card-head">
          <CardTitle
            title="Scenario details"
            sub="Candidate prices evaluated against demand, revenue, profit, and margin guardrails."
          />

          <span className="tag">
            {p.objective.toUpperCase()}
          </span>
        </div>

        {scenarios.length > 0 && (
          <div className="scenario-table">
            <div className="scenario-head">
              <span>Price</span>
              <span>Demand</span>
              <span>Revenue</span>
              <span>Profit</span>
              <span>Margin</span>
              <span>Selected</span>
            </div>

            {scenarios.map((s) => (
              <div
                className={`scenario-row ${
                  rec &&
                  Number(s.price) ===
                    Number(rec.price)
                    ? "selected"
                    : ""
                }`}
                key={s.price}
              >
                <span>
                  {money(s.price, 2)}
                </span>

                <span>
                  {num(
                    s.expected_demand
                  )}
                </span>

                <span>
                  {money(
                    s.expected_revenue
                  )}
                </span>

                <span>
                  {money(
                    s.expected_profit
                  )}
                </span>

                <span>
                  {num(
                    s.margin * 100,
                    1
                  )}
                  %
                </span>

                <span>
                  {rec &&
                  Number(s.price) ===
                    Number(rec.price)
                    ? "BEST"
                    : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="explanation-grid">
        {(p.recommendation?.explanation ||
          []).map((x) => (
            <div
              className="explanation"
              key={x.factor}
            >
              <strong>
                {x.factor}
              </strong>

              <span>
                {x.detail}
              </span>
            </div>
          ))}
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  detail,
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
      </div>

      <div className="metric-value">
        {value}
      </div>

      <div className="metric-detail">
        {detail}
      </div>
    </div>
  );
}

function Feature({ name, value }) {
  return (
    <div className="feature-row">
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HealthCard({
  title,
  value,
  sub,
  ok,
}) {
  return (
    <Card>
      <div className="health-top">
        <span>{title}</span>

        <span
          className={`health-dot ${
            ok ? "ok" : "bad"
          }`}
        />
      </div>

      <div
        className={`health-value ${
          ok ? "" : "bad-text"
        }`}
      >
        {value}
      </div>

      <div className="card-sub">
        {sub}
      </div>
    </Card>
  );
}

export default App;