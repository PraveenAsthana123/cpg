import { useState } from 'react';

/* =========================================================
   DEMO SCENARIOS TAB — Interactive walkthroughs by process
   ========================================================= */

const DEMO_DATA = {
  'demand-forecasting': {
    demos: [
      {
        id: 'D1', title: 'Predict 30-Day Demand',
        description: 'End-to-end walkthrough: load historical sales data, run EDA, train XGBoost, generate 30-day forecast with confidence bands, and export to ERP.',
        difficulty: 'Beginner', time: '12 min', stepsCount: 5, status: 'Ready',
        steps: [
          { n: 1, label: 'Load Data', desc: 'Upload CSV with 24 months of historical sales. System validates schema: date, sku_id, store_id, quantity, price.', input: 'sales_history.csv (3,200 SKUs × 104 weeks)', output: 'Loaded 332,800 rows. 0 duplicates, 12 null values auto-imputed.' },
          { n: 2, label: 'Exploratory Data Analysis', desc: 'Auto-profile the dataset: distributions, seasonality patterns, missing data heatmap, top-20 SKU volume ranking.', input: 'Loaded dataset', output: 'EDA report: 3 high-CV SKUs flagged, weekly seasonality confirmed (ACF spike at lag 52).' },
          { n: 3, label: 'Feature Engineering', desc: 'Create lag features (1,4,8,13 weeks), rolling mean (4w, 8w), promotion flag, holiday calendar, and day-of-week encoding.', input: 'Clean dataset', output: '45 features created from 18 raw columns.' },
          { n: 4, label: 'Train & Validate', desc: 'Train XGBoost with time-series cross-validation (5-fold walk-forward). Tune max_depth, n_estimators, learning_rate via Bayesian search.', input: 'Feature matrix (332,800 × 45)', output: 'Best model: MAPE 8.7% on holdout. Saved to model registry v2.1.' },
          { n: 5, label: 'Generate Forecast & Export', desc: 'Score all 3,200 SKUs for next 30 days. Generate P10/P50/P90 bands. Push to data warehouse. Export CSV and PDF report.', input: 'Trained model + feature pipeline', output: '30-day forecast for 3,200 SKUs exported. PDF report generated. ERP sync triggered.' },
        ],
      },
      {
        id: 'D2', title: 'Promotion Impact Simulator',
        description: 'Select a promotional mechanic (TPR, display, coupon), adjust depth and duration, and instantly see predicted volume uplift and margin impact.',
        difficulty: 'Intermediate', time: '8 min', stepsCount: 4, status: 'Ready',
        steps: [
          { n: 1, label: 'Select SKU & Market', desc: 'Choose product, region, and retailer from dropdowns. Baseline demand is auto-populated from the latest forecast.', input: 'SKU: 12345 — "Natural Oat Biscuit 400g", Region: South', output: 'Baseline: 4,200 units/week. Current price: £2.50.' },
          { n: 2, label: 'Configure Promo', desc: 'Set promotion type (TPR / BOGOFs / Coupon / Display), discount depth (%), and duration (weeks).', input: 'TPR 20% off, 2-week promo', output: 'Promo parameters locked. Historical analogues identified: 14 matching events.' },
          { n: 3, label: 'Run Uplift Model', desc: 'Promo uplift model applies learned lift multipliers, adjusting for seasonality, store type, and pantry loading effect.', input: 'Baseline + promo parameters', output: 'Uplift: +38% (1,596 incremental units). Pantry-load correction applied: −6% in week 3.' },
          { n: 4, label: 'Review P&L Impact', desc: 'System computes gross profit, trade spend, and incremental revenue. Cannibalisation from adjacent SKUs flagged.', input: 'Volume uplift + margin data', output: 'Incremental GM: +£1,450. Trade spend: £840. Promo ROI: 1.73x. Cannib. flag: SKU 12346 −4%.' },
        ],
      },
      {
        id: 'D3', title: 'Stockout Risk Detection',
        description: 'Identify the top at-risk SKU-store combinations where demand forecast exceeds available inventory, factoring in lead times.',
        difficulty: 'Beginner', time: '5 min', stepsCount: 3, status: 'Ready',
        steps: [
          { n: 1, label: 'Sync Inventory', desc: 'Pull current on-hand inventory from WMS via API. Match against active SKU-store pairs.', input: 'WMS snapshot (real-time via API)', output: '94,000 SKU-store records loaded. 280 with SOH = 0 (already out of stock).' },
          { n: 2, label: 'Score Risk', desc: 'For each SKU-store, compute Days Cover = SOH / daily forecast rate. Flag items with Days Cover < lead time as at-risk.', input: 'Inventory + demand forecast + lead times', output: 'Risk scored: 312 high-risk (Days Cover <5d), 841 medium-risk, 92,847 safe.' },
          { n: 3, label: 'Dashboard & Alerts', desc: 'Render ranked list in dashboard. Send push notification to DC planners for top-20. Generate replenishment order suggestions.', input: 'Risk scores', output: 'Dashboard updated. 20 planners notified. 312 replenishment orders drafted.' },
        ],
      },
      {
        id: 'D4', title: 'Multi-Store Comparison',
        description: 'Compare demand patterns, forecast accuracy, and stockout rates across regions and store formats side-by-side.',
        difficulty: 'Intermediate', time: '10 min', stepsCount: 4, status: 'Ready',
        steps: [
          { n: 1, label: 'Select Comparison Set', desc: 'Pick up to 5 stores or regions. Select SKU category and date range.', input: 'Stores: London-SW, Manchester-N, Birmingham-C; SKU: Cereals; Period: Q1 2025', output: 'Comparison scope set: 3 markets × 142 SKUs × 13 weeks.' },
          { n: 2, label: 'Demand Profiles', desc: 'Render weekly demand time series for each market. Highlight divergence weeks.', input: 'Filtered forecast and actuals', output: 'London-SW 18% higher than national avg. Birmingham-C shows promotional spike week 6.' },
          { n: 3, label: 'Accuracy Heatmap', desc: 'Show MAPE by store-week as a heatmap. Drill into worst-performing weeks.', input: 'Actuals vs. forecast archive', output: 'Worst MAPE: Manchester-N week 7 (23.4%) — coincided with competitor promotion.' },
          { n: 4, label: 'Exportable Report', desc: 'Download comparison PDF or CSV for category review meeting.', input: 'Comparison results', output: 'Multi-store_Q1_2025_Cereals.pdf generated (12 pages).' },
        ],
      },
      {
        id: 'D5', title: 'New SKU Cold Start',
        description: 'Generate a launch forecast for a new product with no sales history by matching it to analogous SKUs using attribute similarity.',
        difficulty: 'Advanced', time: '15 min', stepsCount: 5, status: 'Ready',
        steps: [
          { n: 1, label: 'Enter SKU Attributes', desc: 'Enter: category, sub-category, pack size, flavour type, price point, and target retailer.', input: 'New SKU: Protein Oat Bar 55g, £1.80, Snacking, Chocolate', output: 'Attributes encoded into 128-dimensional embedding vector.' },
          { n: 2, label: 'Find Analogues', desc: 'Cosine similarity search across 3,200 active SKUs. Top-5 most similar products selected.', input: 'New SKU embedding', output: 'Top analogues: SKU 2341 (sim 0.92), SKU 1872 (0.89), SKU 3105 (0.86).' },
          { n: 3, label: 'Build Prior', desc: 'Weight analogue launch curves by similarity score. Apply category growth trend and channel mix.', input: 'Analogue launch profiles', output: 'Bayesian prior: 1,200 units/week at launch, ramp to 1,800 by week 8.' },
          { n: 4, label: 'Generate Forecast', desc: 'Output 12-week ramp forecast with ±30% cold-start uncertainty band. Flag as cold-start in system.', input: 'Prior + launch calendar', output: '12-week cold-start forecast produced. Cold-start flag = TRUE. Uncertainty band: ±30%.' },
          { n: 5, label: 'Auto-Update Loop', desc: 'After week 4, system ingests actuals and tightens the prior. Forecast accuracy improves to ±15% by week 6.', input: 'Actuals week 1–4', output: 'Model updated. Uncertainty reduced to ±18%. Planner notified of forecast correction.' },
        ],
      },
      {
        id: 'D6', title: 'What-If Scenario Planning',
        description: 'Use interactive sliders to adjust promotional depth, price point, or external shocks and see demand impact instantly via a pre-trained what-if engine.',
        difficulty: 'Intermediate', time: '7 min', stepsCount: 3, status: 'Ready',
        steps: [
          { n: 1, label: 'Configure Base Scenario', desc: 'Select SKU, region, and planning horizon. Baseline forecast auto-loaded.', input: 'SKU: "Orange Juice 1L", Region: East, Horizon: 8 weeks', output: 'Baseline forecast: 6,800 units/week. Baseline revenue: £27,200/week.' },
          { n: 2, label: 'Adjust Parameters', desc: 'Sliders: Price change (%), Promo depth (%), Distribution gain/loss (stores), Weather index (cold/warm).', input: 'Price +5%, Promo none, +20 distribution stores', output: 'Estimated impact: −3.2% volume, +1.5% revenue due to distribution gain offsetting price elasticity.' },
          { n: 3, label: 'Compare Scenarios', desc: 'Save up to 3 named scenarios. View side-by-side demand curves and financial P&L.', input: 'Scenarios: Base, Price+5%, Promo20%', output: 'Scenario table exported. CFO summary one-pager generated.' },
        ],
      },
      {
        id: 'D7', title: 'Forecast Accuracy Audit',
        description: 'Compare the last 4 weeks of forecasts against actual sales. Identify SKU clusters with systematic bias and trigger retraining if drift is detected.',
        difficulty: 'Advanced', time: '10 min', stepsCount: 4, status: 'Ready',
        steps: [
          { n: 1, label: 'Load Actuals', desc: 'Ingest POS actuals for the trailing 4-week window. Align with forecast archive by SKU-store-week.', input: 'POS actuals (file or API)', output: '94,000 SKU-store-week pairs matched. 0.2% unmatched (new listings).' },
          { n: 2, label: 'Compute Metrics', desc: 'Calculate MAPE, BIAS, SMAPE, and Forecast Value Added (FVA) vs. naïve baseline.', input: 'Actuals vs. forecasts', output: 'Aggregate MAPE: 9.2%. BIAS: +1.8% (slight over-forecast). FVA: +6.3pp vs. naïve.' },
          { n: 3, label: 'Identify Drift', desc: 'Run Mann-Kendall trend test on rolling MAPE. Flag if MAPE increasing >2pp in last 3 periods.', input: 'Rolling MAPE history', output: 'Drift detected in Category: Beverages (MAPE trending +3.1pp). Retraining queued.' },
          { n: 4, label: 'Accuracy Report', desc: 'Generate PDF accuracy audit report with SKU-level heatmap, category breakdown, and recommendations.', input: 'All computed metrics', output: 'accuracy_audit_2025_W14.pdf generated. Sent to Demand Planning inbox.' },
        ],
      },
    ],
    scenarios: [
      { id: 'SC1', label: 'Normal Demand Week', demand: '6,800 units/week', modelBehavior: 'Standard XGBoost ensemble, auto-approved', kpiImpact: 'Fill Rate 98.2%, MAPE 8.7%', color: 'var(--accent-success)' },
      { id: 'SC2', label: 'Promotion Week (TPR 20%)', demand: '9,384 units/week (+38%)', modelBehavior: 'Promo uplift layer active, pantry-load correction applied', kpiImpact: 'Promo accuracy ±7%, GM uplift +£1.4K', color: 'var(--accent-primary)' },
      { id: 'SC3', label: 'Holiday Season (Christmas)', demand: '14,200 units/week (+109%)', modelBehavior: 'Seasonal decomposition, P10/P90 widened ±25%', kpiImpact: 'Zero stockouts on hero SKUs, 4% buffer inventory', color: 'var(--accent-warning)' },
      { id: 'SC4', label: 'New Product Launch', demand: '1,200 → 1,800 units/week (ramp)', modelBehavior: 'Cold-start Bayesian prior, ±30% uncertainty band', kpiImpact: 'Week-4 accuracy within 22%, auto-corrects by week 6', color: 'var(--accent-purple)' },
      { id: 'SC5', label: 'Supply Disruption', demand: '2,100 units available (constrained)', modelBehavior: 'Constrained forecast mode; substitution demand triggered', kpiImpact: 'Lost sales quantified £12K, 3 substitute SKUs uplifted', color: 'var(--accent-danger)' },
    ],
  },

  '__default__': {
    demos: [
      {
        id: 'D1', title: 'Standard AI Pipeline Walkthrough',
        description: 'Load data, run automated EDA, train a model, evaluate performance, and export predictions.',
        difficulty: 'Beginner', time: '10 min', stepsCount: 4, status: 'Ready',
        steps: [
          { n: 1, label: 'Load Data', desc: 'Upload or connect to your data source. System validates schema and data quality.', input: 'Data file or API connection', output: 'Dataset loaded and profiled. Quality report generated.' },
          { n: 2, label: 'EDA & Feature Engineering', desc: 'Auto-profile data. Engineer features and encode categorical variables.', input: 'Clean dataset', output: 'Feature matrix ready. Summary statistics generated.' },
          { n: 3, label: 'Train & Evaluate', desc: 'Train model with cross-validation. Review accuracy metrics.', input: 'Feature matrix', output: 'Model trained. Accuracy metrics within target range.' },
          { n: 4, label: 'Export Results', desc: 'Export predictions, model card, and accuracy report.', input: 'Trained model', output: 'Predictions exported. PDF report generated.' },
        ],
      },
    ],
    scenarios: [
      { id: 'SC1', label: 'Normal Operations', demand: 'Standard volume', modelBehavior: 'Standard inference pipeline', kpiImpact: 'Target accuracy met', color: 'var(--accent-success)' },
    ],
  },
};

/* =========================================================
   SUB-COMPONENTS
   ========================================================= */

const DIFFICULTY_COLORS = {
  Beginner: 'var(--accent-success)',
  Intermediate: 'var(--accent-warning)',
  Advanced: 'var(--accent-danger)',
};

const STATUS_COLORS = {
  Ready: 'var(--accent-success)',
  'Coming Soon': 'var(--text-muted)',
};

function DifficultyBadge({ level }) {
  const color = DIFFICULTY_COLORS[level] || 'var(--text-muted)';
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
      color, background: `${color}18`, border: `1px solid ${color}30`,
    }}>{level}</span>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'var(--text-muted)';
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
      color, background: `${color}18`, border: `1px solid ${color}30`,
    }}>{status === 'Ready' ? '✓ ' : '⏳ '}{status}</span>
  );
}

function DemoCard({ demo, isSelected, onClick }) {
  const isReady = demo.status === 'Ready';
  return (
    <div
      onClick={isReady ? onClick : undefined}
      style={{
        padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)',
        border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
        background: isSelected ? 'rgba(59,130,246,0.05)' : 'var(--bg-card)',
        cursor: isReady ? 'pointer' : 'not-allowed',
        opacity: isReady ? 1 : 0.6,
        boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.15)' : 'var(--shadow-card)',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{demo.id}</span>
        <StatusBadge status={demo.status} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginBottom: 6 }}>{demo.title}</div>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{demo.description}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <DifficultyBadge level={demo.difficulty} />
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>⏱ {demo.time}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>📋 {demo.stepsCount} steps</span>
      </div>
      {isReady && (
        <div style={{ marginTop: 8, fontSize: 9, color: 'var(--accent-primary)', fontWeight: 600 }}>
          {isSelected ? '▲ Collapse details' : '▼ View walkthrough'}
        </div>
      )}
    </div>
  );
}

function DemoDetail({ demo }) {
  const [running, setRunning] = useState(false);
  const [doneStep, setDoneStep] = useState(0);

  function handleRun() {
    if (running) return;
    setRunning(true);
    setDoneStep(0);
    const total = demo.steps.length;
    let i = 0;
    const tick = () => {
      i++;
      setDoneStep(i);
      if (i < total) setTimeout(tick, 900);
      else setRunning(false);
    };
    setTimeout(tick, 600);
  }

  return (
    <div style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--accent-primary)', background: 'rgba(59,130,246,0.04)', marginTop: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
          {demo.id}: {demo.title}
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            padding: '6px 16px', borderRadius: 'var(--border-radius)', border: 'none',
            background: running ? 'var(--bg-hover)' : 'var(--accent-primary)',
            color: running ? 'var(--text-muted)' : '#fff',
            fontWeight: 700, fontSize: 'var(--font-size-xs)', cursor: running ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {running ? '⏳ Running…' : '▶ Run Demo'}
        </button>
      </div>

      {/* Step-by-step */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {demo.steps.map((step) => {
          const isComplete = doneStep >= step.n;
          const isActive = running && doneStep === step.n - 1;
          return (
            <div
              key={step.n}
              style={{
                display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--border-radius)',
                background: isComplete ? 'rgba(16,185,129,0.07)' : isActive ? 'rgba(59,130,246,0.08)' : 'var(--bg-hover)',
                border: `1px solid ${isComplete ? 'rgba(16,185,129,0.25)' : isActive ? 'rgba(59,130,246,0.3)' : 'var(--border-color)'}`,
                transition: 'all 0.3s',
              }}
            >
              {/* Step number */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isComplete ? 'var(--accent-success)' : isActive ? 'var(--accent-primary)' : 'var(--border-color)',
                color: isComplete || isActive ? '#fff' : 'var(--text-muted)',
                fontWeight: 800, fontSize: 12,
              }}>
                {isComplete ? '✓' : step.n}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: isComplete ? 'var(--accent-success)' : isActive ? 'var(--accent-primary)' : 'var(--text-primary)', marginBottom: 3 }}>
                  Step {step.n}: {step.label}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: isComplete ? 6 : 0 }}>{step.desc}</div>
                {(isComplete || isActive) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
                    <div style={{ padding: '5px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 2 }}>INPUT</div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{step.input}</div>
                    </div>
                    {isComplete && (
                      <div style={{ padding: '5px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent-success)', marginBottom: 2 }}>OUTPUT</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{step.output}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScenarioSimulator({ scenarios }) {
  const [selectedId, setSelectedId] = useState(scenarios[0]?.id);
  const scenario = scenarios.find((s) => s.id === selectedId);

  return (
    <div>
      {/* Selector */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
          Select Business Scenario:
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)',
            background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)',
            cursor: 'pointer', outline: 'none', minWidth: 260,
          }}
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>{s.id}: {s.label}</option>
          ))}
        </select>
      </div>

      {/* Detail card */}
      {scenario && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-md)' }}>
          {[
            { icon: '📦', label: 'Expected Demand', value: scenario.demand, color: scenario.color },
            { icon: '🤖', label: 'Model Behavior', value: scenario.modelBehavior, color: 'var(--accent-primary)' },
            { icon: '📊', label: 'KPI Impact', value: scenario.kpiImpact, color: 'var(--accent-success)' },
          ].map((card, i) => (
            <div key={i} style={{
              padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)',
              background: `${card.color}08`, border: `1px solid ${card.color}30`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: '1rem' }}>{card.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</span>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Before/After comparison */}
      {scenario && (
        <div style={{ marginTop: 'var(--spacing-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius)', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', marginBottom: 8 }}>🔴 Without AI (Manual)</div>
            <ul style={{ paddingLeft: 16 }}>
              <li style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7 }}>Planner manually adjusts spreadsheet forecast</li>
              <li style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7 }}>1–2 days to produce updated plan</li>
              <li style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7 }}>No confidence bands; planners over-buffer by 25%</li>
              <li style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7 }}>MAPE typically 18–24% in volatile scenarios</li>
            </ul>
          </div>
          <div style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius)', border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--accent-success)', marginBottom: 8 }}>🟢 With AI</div>
            <ul style={{ paddingLeft: 16 }}>
              <li style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7 }}>Auto-forecast generated in &lt;4 hours</li>
              <li style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7 }}>P10/P50/P90 bands — planners review exceptions only</li>
              <li style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7 }}>Scenario-specific model layer activates automatically</li>
              <li style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7 }}>MAPE &lt;10% with drift detection and auto-retraining</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN EXPORT
   ========================================================= */

export default function ProcessDemoTab({ process }) {
  const data = DEMO_DATA[process.id] || DEMO_DATA['__default__'];
  const [selectedDemoId, setSelectedDemoId] = useState(null);

  const selectedDemo = data.demos.find((d) => d.id === selectedDemoId);

  return (
    <div>
      {/* A. Demo List */}
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🎬 Demo Walkthroughs</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Click a demo to view step-by-step walkthrough</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--spacing-md)', marginBottom: selectedDemo ? 'var(--spacing-md)' : 0 }}>
          {data.demos.map((demo) => (
            <DemoCard
              key={demo.id}
              demo={demo}
              isSelected={selectedDemoId === demo.id}
              onClick={() => setSelectedDemoId(selectedDemoId === demo.id ? null : demo.id)}
            />
          ))}
        </div>

        {/* B. Demo Detail */}
        {selectedDemo && <DemoDetail demo={selectedDemo} />}
      </div>

      {/* C. Business Scenario Simulator */}
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">⚙️ Business Scenario Simulator</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Select a scenario to see expected demand, model behavior, and KPI impact</span>
        </div>
        <ScenarioSimulator scenarios={data.scenarios} />
      </div>
    </div>
  );
}
