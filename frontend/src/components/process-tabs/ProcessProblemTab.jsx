import { useState } from 'react';

/* =========================================================
   PROBLEM & USE CASE TAB — Data keyed by process ID
   ========================================================= */

const PROBLEM_DATA = {
  'demand-forecasting': {
    statement: {
      what: 'Inaccurate demand forecasts cause excess inventory or stockouts, leading to millions in lost revenue and write-offs annually across CPG SKUs and distribution channels.',
      why: 'A 5% improvement in forecast accuracy translates to ~$2M in reduced working capital and a 12% decrease in stockouts — directly impacting revenue, service levels, and customer satisfaction.',
      who: 'Demand Planners, Supply Chain Managers, Finance Analysts, Category Managers, Distribution Centre Operators, and Retail Partners.',
      painPoints: [
        'Manual Excel-based forecasting is error-prone and takes 2–3 days per cycle',
        'No seasonal or promotional uplift modelled — planners add adjustments by hand',
        'Forecast is at brand/week level; no SKU-level or store-level granularity',
        'Post-event review is manual; no automated accuracy tracking or drift detection',
        'No confidence intervals — planners cannot quantify uncertainty for budget planning',
        'New SKU cold-start has no data-driven approach; relies entirely on planner judgment',
      ],
    },
    fiveW: {
      who: ['Demand Planners (primary users)', 'Supply Chain Managers (decisions)', 'Finance & FP&A (budget planning)', 'Category Managers (assortment)', 'Distribution Centre staff (execution)', 'Retail Partners (service level expectations)'],
      what: ['30-day rolling SKU-level demand forecast', 'Promotional uplift quantification', 'Stockout risk scoring per SKU/store', 'Confidence bands (P10/P50/P90)', 'Model drift detection and retraining triggers'],
      when: ['Forecast generated every Monday (weekly cycle)', 'Promotional events require ad-hoc runs 2 weeks ahead', 'Holiday season planning starts 8 weeks in advance', 'New product launches need cold-start forecast at listing date'],
      where: ['Across 5 distribution regions (North, South, East, West, Central)', '3,200 active SKUs across 8 product categories', '850+ retail locations and 3 DTC channels', 'ERP integration: SAP S/4HANA and Oracle Planning Cloud'],
      why: ['Manual process cannot scale with SKU proliferation (+18% YoY)', 'Competitor AI adoption is eroding service-level advantage', 'Stockout rate at 4.3% vs industry target of <2%', 'CFO mandated 20% working capital reduction by Q4 2025'],
    },
    asisTobes: [
      { dimension: 'People', asis: '8 demand planners, manual adjustments, gut-feel for promotions', tobe: '3 planners overseeing AI outputs, exception-based management' },
      { dimension: 'Process', asis: '3-day weekly cycle, Excel-based, highly manual, no version control', tobe: '4-hour automated run, planner reviews exceptions only, full audit trail' },
      { dimension: 'Technology', asis: 'Excel + SAP extract, no ML, email-based collaboration', tobe: 'XGBoost + LightGBM ensemble, feature store, REST API to ERP' },
      { dimension: 'Data', asis: 'Brand/week level, 18 months history, no external signals', tobe: 'SKU/store/day level, 4 years history, weather, events, promotions' },
      { dimension: 'Cost', asis: '$340K/year in planner time + $2.1M in excess inventory write-offs', tobe: '$120K/year planner time + <$400K inventory write-offs (target)' },
      { dimension: 'Speed', asis: '3 days to generate a full forecast cycle', tobe: '<4 hours automated + <1 hour planner review' },
      { dimension: 'Accuracy', asis: 'MAPE 18–24% (brand/week level)', tobe: 'MAPE <10% (SKU/store/week level target)' },
    ],
    useCases: [
      {
        id: 'UC-01', title: 'Weekly SKU Demand Forecast', priority: 'P0',
        description: 'Generate 30-day rolling demand forecast at SKU × store × week granularity with confidence bands.',
        actors: ['Demand Planner', 'Forecast Engine', 'ERP System'],
        preconditions: ['Historical sales data ≥12 months available', 'Promotional calendar loaded', 'Feature pipeline executed'],
        postconditions: ['Forecast written to data warehouse', 'Alert fired if MAPE >12% on validation set', 'PDF report generated'],
      },
      {
        id: 'UC-02', title: 'Promotional Uplift Forecast', priority: 'P0',
        description: 'Predict incremental volume during promotional events (TPR, displays, coupons) for budget planning.',
        actors: ['Trade Marketing Manager', 'Promo Uplift Model', 'Category Manager'],
        preconditions: ['Promo event defined with depth and mechanic', 'Baseline forecast generated', 'Historical promo lift data available'],
        postconditions: ['Uplift volume quantified per SKU', 'ROI estimate produced', 'Cannibalization impact flagged'],
      },
      {
        id: 'UC-03', title: 'Stockout Risk Alert', priority: 'P1',
        description: 'Score each SKU-store combination for stockout risk given the current forecast vs. inventory on hand.',
        actors: ['Supply Chain Manager', 'Risk Scoring Engine', 'DC Operations'],
        preconditions: ['Current inventory levels synced from WMS', 'Demand forecast available', 'Lead time data loaded'],
        postconditions: ['Risk ranked list published to dashboard', 'Replenishment order recommendations generated', 'Planner notified for top-20 at-risk SKUs'],
      },
      {
        id: 'UC-04', title: 'New SKU Cold Start', priority: 'P1',
        description: 'Produce a launch forecast for a new SKU with no sales history using analogous SKU matching.',
        actors: ['Category Manager', 'Cold Start Model', 'Demand Planner'],
        preconditions: ['New SKU attributes defined (category, pack size, price point)', 'Analogous SKU selected or auto-matched'],
        postconditions: ['12-week launch forecast produced', 'Uncertainty flag shown (cold start)', 'Model auto-updated after first 4 weeks of actuals'],
      },
      {
        id: 'UC-05', title: 'Forecast Accuracy Audit', priority: 'P2',
        description: 'Compare forecast vs. actuals on a rolling 4-week holdout; track drift and trigger retraining.',
        actors: ['MLOps Engineer', 'Accuracy Monitor', 'Demand Planner'],
        preconditions: ['Actuals available for prior 4-week window', 'Forecast archive maintained'],
        postconditions: ['MAPE / BIAS / SMAPE metrics reported', 'Drift alert fired if MAPE rises >15%', 'Retraining job queued if threshold breached'],
      },
      {
        id: 'UC-06', title: 'What-If Scenario Planner', priority: 'P2',
        description: 'Allow planners to adjust promo depth, price, or external shocks and see demand impact instantly.',
        actors: ['Demand Planner', 'Finance Analyst', 'Scenario Engine'],
        preconditions: ['Baseline forecast available', 'Scenario parameters defined by user'],
        postconditions: ['Scenario demand curve generated', 'Financial P&L impact shown', 'Scenario saved and exportable'],
      },
    ],
    scenarios: [
      {
        id: 'S1', title: 'Normal Demand Week', trigger: 'No promotional events, no holidays, stable supply',
        expected: 'Model uses baseline demand pattern; ensemble of XGBoost + LightGBM weighted by recent accuracy.',
        kpiImpact: 'MAPE target <10%, Fill Rate >98%, Planner time <1 hr/week',
        aiResponse: 'Produces 30-day rolling forecast with P10/P50/P90 bands. Auto-approved if validation MAPE <8%.',
      },
      {
        id: 'S2', title: 'Promotion Week', trigger: 'TPR event with 20% price reduction on selected SKUs',
        expected: 'Promo uplift model activates. Historical lift multipliers applied. Cannibalization cross-checked.',
        kpiImpact: 'Uplift accuracy ±8% of actual; promotion ROI report generated within 2 hours of event end',
        aiResponse: 'Promo feature layer injected into feature store. Ensemble model retrained with promo flag. Residual volume attributed to promo vs. baseline.',
      },
      {
        id: 'S3', title: 'Holiday Season', trigger: 'Christmas / Diwali / Eid seasonal event, 8 weeks ahead',
        expected: 'Holiday demand spike modelled with 3-year seasonal decomposition; confidence bands widened ±20%.',
        kpiImpact: 'Avoid stockouts on top 200 holiday SKUs; excess inventory buffer optimised to <5% overage',
        aiResponse: 'Seasonal model weights increased. External calendar API enriches features. Planner override UI enabled for high-value SKUs.',
      },
      {
        id: 'S4', title: 'New Product Launch', trigger: 'New SKU listed with no sales history',
        expected: 'Cold-start model matches analogous SKU by category, pack size, and price index. 12-week ramp forecast produced.',
        kpiImpact: 'First-4-week forecast accuracy within 20% of actuals; model self-corrects by week 5',
        aiResponse: 'Analogous SKU auto-selected via cosine similarity on attribute embeddings. Bayesian prior set from analogous; updated weekly with actuals.',
      },
      {
        id: 'S5', title: 'Supply Disruption', trigger: 'Key ingredient shortage or DC outage, demand constrained',
        expected: 'Constrained forecast generated; unfulfillable volume reallocated to alternative SKUs or channels.',
        kpiImpact: 'Lost sales quantified within 4 hours; alternative SKU uplift forecast generated to partially offset shortfall',
        aiResponse: 'Supply constraint flag injected into planning horizon. Substitution demand model triggered for related SKUs. Alert escalated to Supply Chain Manager dashboard.',
      },
    ],
    value: {
      business: [
        { label: 'Revenue Protection', value: '+$3.2M/yr', detail: 'Avoiding stockouts on high-velocity SKUs' },
        { label: 'Inventory Reduction', value: '-$1.8M WC', detail: '20% reduction in excess stock write-offs' },
        { label: 'Planner Efficiency', value: '60% time saved', detail: 'From 3 days → <4 hours per weekly cycle' },
        { label: 'Service Level Improvement', value: '+2.3pp', detail: 'Fill rate from 95.7% → 98%+ target' },
      ],
      ai: [
        { label: 'Predict', detail: '30-day SKU-level demand with 90% confidence bands' },
        { label: 'Decide', detail: 'Auto-approve forecasts within accuracy gate; flag exceptions' },
        { label: 'Explain', detail: 'SHAP feature importance per SKU — planner-readable' },
        { label: 'Automate', detail: 'End-to-end pipeline: ingest → train → forecast → push to ERP' },
      ],
      operational: [
        { label: 'Speed', value: '18x faster', detail: '3 days → 4 hours forecast cycle' },
        { label: 'Accuracy', value: 'MAPE <10%', detail: 'From 18–24% manual baseline' },
        { label: 'Scale', value: '3,200 SKUs', detail: 'From brand-level to SKU×store×week' },
        { label: 'Coverage', value: '850+ stores', detail: 'Full network vs. top-50 manual coverage' },
      ],
    },
  },

  '__default__': {
    statement: {
      what: 'The current process relies on manual, rule-based methods that cannot scale, adapt to changing patterns, or provide decision-support at the speed the business requires.',
      why: 'Operational inefficiency is costing the organisation in time, headcount, and quality of decisions — introducing AI will unlock significant efficiency gains and risk reduction.',
      who: 'Business Analysts, Operations Managers, Data Teams, Finance, and senior leadership who rely on the outputs.',
      painPoints: [
        'Manual process is slow and inconsistent — heavily dependent on individual expertise',
        'No ability to detect patterns across thousands of variables simultaneously',
        'No confidence scoring — users cannot distinguish reliable outputs from guesses',
        'Process cannot scale with business growth without proportional headcount increase',
        'Audit trail is incomplete; difficult to explain decisions to stakeholders',
      ],
    },
    fiveW: {
      who: ['Business Analysts', 'Operations Managers', 'Data Teams', 'Finance', 'Leadership'],
      what: ['Automate manual decision-making process', 'Provide data-driven insights at scale', 'Generate confidence intervals and explainability'],
      when: ['Daily/weekly operational cycles', 'Ad-hoc business queries', 'Quarterly planning cycles'],
      where: ['Across primary business units', 'Core ERP and data warehouse systems', 'Reporting and planning tools'],
      why: ['Manual process cannot keep pace with data volume growth', 'Competitor adoption of AI is eroding market advantage', 'Board mandate for digital transformation'],
    },
    asisTobes: [
      { dimension: 'People', asis: 'Large team, manual work, expert-dependent', tobe: 'Smaller team managing exceptions, AI-assisted decisions' },
      { dimension: 'Process', asis: 'Manual, multi-day cycle, inconsistent quality', tobe: 'Automated pipeline, hours not days, consistent quality' },
      { dimension: 'Technology', asis: 'Spreadsheets, manual exports, email-based', tobe: 'ML pipeline, API integrations, real-time dashboard' },
      { dimension: 'Data', asis: 'Aggregated, delayed, incomplete', tobe: 'Granular, real-time, enriched with external signals' },
      { dimension: 'Cost', asis: 'High headcount cost, frequent errors and rework', tobe: 'Lower ops cost, fewer errors, faster time-to-insight' },
      { dimension: 'Speed', asis: 'Days per cycle', tobe: 'Hours per cycle' },
      { dimension: 'Accuracy', asis: 'Variable, person-dependent', tobe: 'Consistent, measurable, continuously improving' },
    ],
    useCases: [
      {
        id: 'UC-01', title: 'Primary Use Case', priority: 'P0',
        description: 'Core AI-powered automation of the primary business process.',
        actors: ['Business User', 'AI Engine', 'Backend System'],
        preconditions: ['Historical data available', 'Model trained and validated'],
        postconditions: ['Output generated', 'Results published to dashboard', 'Audit trail recorded'],
      },
    ],
    scenarios: [
      {
        id: 'S1', title: 'Normal Operations', trigger: 'Standard business cycle with no anomalies',
        expected: 'AI model produces standard output within SLA.',
        kpiImpact: 'Target accuracy met; operational KPIs within range.',
        aiResponse: 'Standard inference pipeline runs; results auto-published if within confidence threshold.',
      },
    ],
    value: {
      business: [
        { label: 'Efficiency Gain', value: '50%+', detail: 'Reduction in manual processing time' },
        { label: 'Cost Reduction', value: '30%', detail: 'Lower operational cost per decision' },
      ],
      ai: [
        { label: 'Predict', detail: 'Data-driven forecasting replacing manual estimation' },
        { label: 'Explain', detail: 'SHAP-based explainability for user trust' },
      ],
      operational: [
        { label: 'Speed', value: '5x faster', detail: 'Days to hours' },
        { label: 'Scale', value: '10x coverage', detail: 'More entities with same team size' },
      ],
    },
  },
};

/* =========================================================
   SUB-COMPONENTS
   ========================================================= */

function SectionHeader({ title, subtitle }) {
  return (
    <div className="content-section-header">
      <span className="content-section-title">{title}</span>
      {subtitle && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{subtitle}</span>}
    </div>
  );
}

function Tag({ children, color = 'var(--accent-primary)', bg }) {
  const bgVal = bg || `${color}18`;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      background: bgVal, color, fontSize: 10, fontWeight: 700,
      border: `1px solid ${color}33`,
    }}>{children}</span>
  );
}

function ProblemStatement({ stmt }) {
  const cards = [
    { icon: '❓', label: 'What is the Problem?', text: stmt.what, color: 'var(--accent-primary)' },
    { icon: '💥', label: 'Why Does It Matter?', text: stmt.why, color: 'var(--accent-danger)' },
    { icon: '👥', label: 'Who is Affected?', text: stmt.who, color: 'var(--accent-purple)' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)',
            background: `${c.color}08`, border: `1px solid ${c.color}30`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: c.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{c.text}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🔴</span> Current Pain Points
        </div>
        <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stmt.painPoints.map((pt, i) => (
            <li key={i} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{pt}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FiveWGrid({ fiveW }) {
  const items = [
    { key: 'who', label: 'WHO', icon: '👥', color: 'var(--accent-primary)', bg: 'rgba(59,130,246,0.07)' },
    { key: 'what', label: 'WHAT', icon: '🎯', color: 'var(--accent-success)', bg: 'rgba(16,185,129,0.07)' },
    { key: 'when', label: 'WHEN', icon: '⏱️', color: 'var(--accent-warning)', bg: 'rgba(245,158,11,0.07)' },
    { key: 'where', label: 'WHERE', icon: '📍', color: 'var(--accent-purple)', bg: 'rgba(139,92,246,0.07)' },
    { key: 'why', label: 'WHY', icon: '💡', color: 'var(--accent-pink)', bg: 'rgba(236,72,153,0.07)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
      {items.map((item) => (
        <div key={item.key} style={{
          padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)',
          background: item.bg, border: `1px solid ${item.color}30`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            <span style={{
              fontWeight: 800, fontSize: 13, color: item.color,
              letterSpacing: '0.08em',
            }}>{item.label}</span>
          </div>
          <ul style={{ paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {fiveW[item.key].map((pt, i) => (
              <li key={i} style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{pt}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function AsIsToBeTable({ rows }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderRadius: 'var(--border-radius)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        {/* Header */}
        <div style={{ padding: '10px 14px', background: 'var(--bg-hover)', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>Dimension</div>
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.07)', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', borderBottom: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)' }}>🔴 AS-IS (Current State)</div>
        <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.07)', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--accent-success)', borderBottom: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)' }}>🟢 TO-BE (Target State)</div>

        {/* Rows */}
        {rows.map((row, i) => (
          <>
            <div key={`dim-${i}`} style={{ padding: '10px 14px', borderBottom: i < rows.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', background: i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-hover)' }}>{row.dimension}</div>
            <div key={`asis-${i}`} style={{ padding: '10px 14px', borderBottom: i < rows.length - 1 ? '1px solid var(--border-color)' : 'none', borderLeft: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, background: i % 2 === 0 ? 'rgba(239,68,68,0.03)' : 'rgba(239,68,68,0.06)' }}>{row.asis}</div>
            <div key={`tobe-${i}`} style={{ padding: '10px 14px', borderBottom: i < rows.length - 1 ? '1px solid var(--border-color)' : 'none', borderLeft: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, background: i % 2 === 0 ? 'rgba(16,185,129,0.03)' : 'rgba(16,185,129,0.06)' }}>{row.tobe}</div>
          </>
        ))}
      </div>
    </div>
  );
}

const PRIORITY_COLORS = { P0: 'var(--accent-danger)', P1: 'var(--accent-warning)', P2: 'var(--accent-primary)' };

function UseCaseGrid({ cases }) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
        {cases.map((uc) => {
          const isSelected = selected === uc.id;
          const pc = PRIORITY_COLORS[uc.priority] || 'var(--text-muted)';
          return (
            <div
              key={uc.id}
              onClick={() => setSelected(isSelected ? null : uc.id)}
              style={{
                padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)',
                border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: isSelected ? 'rgba(59,130,246,0.05)' : 'var(--bg-card)',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.15)' : 'var(--shadow-card)',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{uc.id}</span>
                <Tag color={pc}>{uc.priority}</Tag>
              </div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginBottom: 6 }}>{uc.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{uc.description}</div>

              {isSelected && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actors</span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {uc.actors.map((a, i) => <Tag key={i} color="var(--accent-purple)">{a}</Tag>)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pre-conditions</span>
                    <ul style={{ paddingLeft: 14, marginTop: 4 }}>
                      {uc.preconditions.map((p, i) => <li key={i} style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Post-conditions</span>
                    <ul style={{ paddingLeft: 14, marginTop: 4 }}>
                      {uc.postconditions.map((p, i) => <li key={i} style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              <div style={{ fontSize: 9, color: 'var(--accent-primary)', fontWeight: 600, marginTop: 4 }}>
                {isSelected ? '▲ Collapse' : '▼ View Details'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BusinessScenarios({ scenarios }) {
  const [activeId, setActiveId] = useState(scenarios[0]?.id);

  const colors = [
    'var(--accent-primary)', 'var(--accent-success)', 'var(--accent-warning)',
    'var(--accent-purple)', 'var(--accent-pink)',
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--spacing-md)' }}>
      {/* Sidebar list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {scenarios.map((s, i) => {
          const color = colors[i % colors.length];
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              style={{
                padding: '8px 12px', borderRadius: 'var(--border-radius)', border: '1px solid',
                borderColor: isActive ? color : 'var(--border-color)',
                background: isActive ? `${color}12` : 'var(--bg-card)',
                textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 800, color: isActive ? color : 'var(--text-muted)', letterSpacing: '0.08em' }}>{s.id}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', marginTop: 2, lineHeight: 1.3 }}>{s.title}</div>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {scenarios.map((s, i) => {
        if (s.id !== activeId) return null;
        const color = colors[i % colors.length];
        return (
          <div key={s.id} style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)', border: `1px solid ${color}30`, background: `${color}06` }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginBottom: 12 }}>
              <span style={{ color }}>{s.id}</span>: {s.title}
            </div>
            {[
              { label: 'Trigger', value: s.trigger, icon: '⚡' },
              { label: 'Expected Behavior', value: s.expected, icon: '🎯' },
              { label: 'KPI Impact', value: s.kpiImpact, icon: '📊' },
              { label: 'AI Response', value: s.aiResponse, icon: '🤖' },
            ].map((row, ri) => (
              <div key={ri} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.9rem' }}>{row.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</span>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 20 }}>{row.value}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ValueProposition({ value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
      {/* Business Value */}
      <div style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--spacing-md)' }}>
          <span style={{ fontSize: '1.2rem' }}>💰</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--accent-success)' }}>Business Value</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {value.business.map((v, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 10px', borderRadius: 'var(--border-radius)', background: 'rgba(16,185,129,0.08)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>{v.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{v.detail}</div>
              </div>
              {v.value && <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--accent-success)', whiteSpace: 'nowrap', marginLeft: 8 }}>{v.value}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* AI Value */}
      <div style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--spacing-md)' }}>
          <span style={{ fontSize: '1.2rem' }}>🤖</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--accent-primary)' }}>AI Value</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {value.ai.map((v, i) => {
            const aiColors = ['var(--accent-primary)', 'var(--accent-purple)', 'var(--accent-warning)', 'var(--accent-success)'];
            const c = aiColors[i % aiColors.length];
            return (
              <div key={i} style={{ padding: '10px', borderRadius: 'var(--border-radius)', background: `${c}10`, border: `1px solid ${c}25`, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: c, marginBottom: 4 }}>{v.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{v.detail}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Value */}
      <div style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--spacing-md)' }}>
          <span style={{ fontSize: '1.2rem' }}>⚙️</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--accent-purple)' }}>Operational Value</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {value.operational.map((v, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 10px', borderRadius: 'var(--border-radius)', background: 'rgba(139,92,246,0.08)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>{v.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{v.detail}</div>
              </div>
              {v.value && <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--accent-purple)', whiteSpace: 'nowrap', marginLeft: 8 }}>{v.value}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN EXPORT
   ========================================================= */

export default function ProcessProblemTab({ process }) {
  const data = PROBLEM_DATA[process.id] || PROBLEM_DATA['__default__'];

  return (
    <div>
      {/* A. Problem Statement */}
      <div className="content-section">
        <SectionHeader title="❓ Problem Statement" subtitle="Business context, impact & affected stakeholders" />
        <ProblemStatement stmt={data.statement} />
      </div>

      {/* B. 5W Analysis */}
      <div className="content-section">
        <SectionHeader title="🔍 5W Analysis" subtitle="Who · What · When · Where · Why" />
        <FiveWGrid fiveW={data.fiveW} />
      </div>

      {/* C. AS-IS vs TO-BE */}
      <div className="content-section">
        <SectionHeader title="🔄 AS-IS vs TO-BE" subtitle="Current state vs. target AI-powered state across key dimensions" />
        <AsIsToBeTable rows={data.asisTobes} />
      </div>

      {/* D. Use Cases */}
      <div className="content-section">
        <SectionHeader title="📋 Use Cases" subtitle="Click a card to expand actors, pre-conditions & post-conditions" />
        <UseCaseGrid cases={data.useCases} />
      </div>

      {/* E. Business Scenarios */}
      <div className="content-section">
        <SectionHeader title="🎬 Business Scenarios" subtitle="How the AI responds in each real-world situation" />
        <BusinessScenarios scenarios={data.scenarios} />
      </div>

      {/* F. Value Proposition */}
      <div className="content-section">
        <SectionHeader title="💎 Value Proposition" subtitle="Business, AI, and operational returns" />
        <ValueProposition value={data.value} />
      </div>
    </div>
  );
}
