import { useState } from 'react';

const DOC_TYPES = [
  { type: 'C4', icon: '🏗️', title: 'C4 Architecture Model', description: 'Context, Container, Component, and Code diagrams showing system structure at 4 levels of abstraction.' },
  { type: 'HLD', icon: '📐', title: 'High-Level Design', description: 'System overview, major components, data flows, integration points, and NFRs for this process.' },
  { type: 'LLD', icon: '📋', title: 'Low-Level Design', description: 'Detailed class diagrams, API contracts, database schema, state machines, and algorithm pseudocode.' },
  { type: 'BRD', icon: '📝', title: 'Business Requirements', description: 'Functional and non-functional requirements, acceptance criteria, stakeholder sign-offs, and use cases.' },
  { type: 'ADR', icon: '🏛️', title: 'Architecture Decision Records', description: 'Key architecture decisions with context, decision made, consequences, and alternatives considered.' },
  { type: 'API', icon: '🔌', title: 'API Documentation', description: 'REST API endpoints, request/response schemas, authentication, error codes, and Postman collection.' },
  { type: 'ML', icon: '🧠', title: 'Model Card', description: 'Model metadata, intended use, evaluation results, ethical considerations, and caveats.' },
  { type: 'OPS', icon: '⚙️', title: 'Operations Runbook', description: 'Deployment procedures, monitoring setup, alerting rules, incident response, and rollback steps.' },
];

const COMING_SOON = [
  { label: 'Sequence Diagrams', eta: 'Q2 2025' },
  { label: 'Data Dictionary', eta: 'Q2 2025' },
  { label: 'Test Evidence Report', eta: 'Q3 2025' },
  { label: 'Compliance Certificate', eta: 'Q3 2025' },
];

/* ---- Process Flow steps ---- */
const PROCESS_FLOW_NODES = [
  { label: 'Data Sources', icon: '🗄️', type: 'input', color: 'var(--accent-primary)', bg: 'rgba(59,130,246,0.08)', active: true },
  { label: 'Ingestion', icon: '📥', type: 'process', color: 'var(--accent-success)', bg: 'rgba(16,185,129,0.08)', active: true },
  { label: 'Validation', icon: '✅', type: 'process', color: 'var(--accent-warning)', bg: 'rgba(245,158,11,0.08)', active: true },
  { label: 'Feature Store', icon: '🏪', type: 'store', color: 'var(--accent-purple)', bg: 'rgba(139,92,246,0.08)', active: true },
  { label: 'Model Training', icon: '🤖', type: 'process', color: 'var(--accent-primary)', bg: 'rgba(59,130,246,0.08)', active: true },
  { label: 'Evaluation', icon: '📊', type: 'decision', color: 'var(--accent-warning)', bg: 'rgba(245,158,11,0.08)', active: false },
  { label: 'Deployment', icon: '🚀', type: 'process', color: 'var(--accent-success)', bg: 'rgba(16,185,129,0.08)', active: false },
  { label: 'Monitoring', icon: '📡', type: 'output', color: 'var(--accent-pink)', bg: 'rgba(236,72,153,0.08)', active: false },
];

const ANALYSIS_FLOW_NODES = [
  { label: 'Raw Data', icon: '📂', color: 'var(--accent-primary)', bg: 'rgba(59,130,246,0.08)' },
  { label: 'EDA', icon: '🔍', color: 'var(--accent-success)', bg: 'rgba(16,185,129,0.08)' },
  { label: 'Cleaning', icon: '🧹', color: 'var(--accent-warning)', bg: 'rgba(245,158,11,0.08)' },
  { label: 'Feature Eng.', icon: '🛠️', color: 'var(--accent-purple)', bg: 'rgba(139,92,246,0.08)' },
  { label: 'Model Select', icon: '🧠', color: 'var(--accent-primary)', bg: 'rgba(59,130,246,0.08)' },
  { label: 'Training', icon: '🏋️', color: 'var(--accent-success)', bg: 'rgba(16,185,129,0.08)' },
  { label: 'Validation', icon: '📋', color: 'var(--accent-warning)', bg: 'rgba(245,158,11,0.08)' },
  { label: 'Testing', icon: '🧪', color: 'var(--accent-pink)', bg: 'rgba(236,72,153,0.08)' },
  { label: 'Production', icon: '🚀', color: 'var(--accent-success)', bg: 'rgba(16,185,129,0.1)' },
];

/* ---- Inline styles for flow diagram ---- */
const flowNodeStyle = (node, isActive) => ({
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: '8px 10px', borderRadius: node.type === 'decision' ? 0 : 'var(--border-radius)',
  background: isActive ? node.bg : 'var(--bg-hover)',
  border: `1px solid ${isActive ? node.color : 'var(--border-color)'}`,
  minWidth: 80, maxWidth: 90, textAlign: 'center', flexShrink: 0,
  transform: node.type === 'decision' ? 'rotate(45deg)' : 'none',
  opacity: isActive ? 1 : 0.55,
  position: 'relative',
  transition: 'all 0.2s',
});

function FlowArrow({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <div style={{
        width: 20, height: 2,
        background: active ? 'var(--accent-primary)' : 'var(--border-color)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', right: -5, top: -3,
          width: 0, height: 0,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderLeft: `6px solid ${active ? 'var(--accent-primary)' : 'var(--border-color)'}`,
        }} />
      </div>
    </div>
  );
}

function ProcessFlowDiagram() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 700, padding: '16px 0' }}>
          {PROCESS_FLOW_NODES.map((node, idx) => {
            const isActive = node.active;
            const isHovered = hoveredIdx === idx;
            const isDiamond = node.type === 'decision';

            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Node */}
                <div
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'default' }}
                >
                  {/* Diamond wrapper for decision nodes */}
                  {isDiamond ? (
                    <div style={{ position: 'relative', width: 72, height: 72 }}>
                      <div style={{
                        position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%',
                        background: isHovered ? node.bg : (isActive ? node.bg : 'var(--bg-hover)'),
                        border: `1px solid ${isActive ? node.color : 'var(--border-color)'}`,
                        transform: 'rotate(45deg)',
                        borderRadius: 4,
                        opacity: isActive ? 1 : 0.55,
                      }} />
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 2,
                      }}>
                        <span style={{ fontSize: '1rem' }}>{node.icon}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: node.color, textAlign: 'center', lineHeight: 1.2 }}>{node.label}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '10px 8px', borderRadius: 'var(--border-radius)',
                      background: isHovered ? node.bg : (isActive ? node.bg : 'var(--bg-hover)'),
                      border: `1.5px solid ${isActive ? node.color : 'var(--border-color)'}`,
                      minWidth: 76, maxWidth: 90, textAlign: 'center', flexShrink: 0,
                      opacity: isActive ? 1 : 0.55, gap: 3,
                      boxShadow: isHovered ? `0 0 0 3px ${node.color}22` : 'none',
                      transition: 'all 0.15s',
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>{node.icon}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? node.color : 'var(--text-muted)', lineHeight: 1.2 }}>{node.label}</span>
                    </div>
                  )}
                  {/* Status badge */}
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                    background: isActive ? node.bg : 'var(--bg-hover)',
                    color: isActive ? node.color : 'var(--text-muted)',
                    border: `1px solid ${isActive ? node.color + '44' : 'var(--border-color)'}`,
                  }}>
                    {isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                {/* Arrow between nodes */}
                {idx < PROCESS_FLOW_NODES.length - 1 && (
                  <FlowArrow active={isActive && PROCESS_FLOW_NODES[idx + 1].active} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
        {[
          { shape: 'rect', label: 'Process Step', color: 'var(--accent-primary)' },
          { shape: 'diamond', label: 'Decision Point', color: 'var(--accent-warning)' },
          { shape: 'rect', label: 'Active', color: 'var(--accent-success)', active: true },
          { shape: 'rect', label: 'Inactive', color: 'var(--text-muted)', faded: true },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)' }}>
            <div style={{
              width: item.shape === 'diamond' ? 10 : 12, height: 10,
              background: item.faded ? 'var(--bg-hover)' : `${item.color}22`,
              border: `1px solid ${item.faded ? 'var(--border-color)' : item.color}`,
              transform: item.shape === 'diamond' ? 'rotate(45deg)' : 'none',
              borderRadius: 2, flexShrink: 0,
            }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisFlowDiagram() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 700, padding: '12px 0' }}>
        {ANALYSIS_FLOW_NODES.map((node, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '8px 6px', borderRadius: 'var(--border-radius)',
                background: hoveredIdx === idx ? node.bg : (idx < 3 ? node.bg : 'var(--bg-hover)'),
                border: `1.5px solid ${idx < 3 ? node.color : 'var(--border-color)'}`,
                minWidth: 70, maxWidth: 80, textAlign: 'center', flexShrink: 0, gap: 3,
                opacity: idx > 5 ? 0.7 : 1,
                boxShadow: hoveredIdx === idx ? `0 0 0 3px ${node.color}22` : 'none',
                transition: 'all 0.15s', cursor: 'default',
              }}
            >
              <span style={{ fontSize: '0.95rem' }}>{node.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: idx < 3 ? node.color : 'var(--text-secondary)', lineHeight: 1.2 }}>{node.label}</span>
            </div>
            {idx < ANALYSIS_FLOW_NODES.length - 1 && (
              <FlowArrow active={idx < 5} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProcessDocsTab({ process, dept }) {
  return (
    <div>
      {/* ---- PROCESS FLOW CHART ---- */}
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🔄 Process Flow Chart</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>End-to-end data pipeline</span>
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', lineHeight: 1.6 }}>
          The diagram below shows the full data lifecycle from raw sources through to production monitoring.
          Active steps are highlighted — hover each node for details.
        </p>
        <ProcessFlowDiagram />

        {/* Branching info */}
        <div style={{
          marginTop: 'var(--spacing-md)', padding: 'var(--spacing-sm) var(--spacing-md)',
          background: 'rgba(245,158,11,0.06)', borderRadius: 'var(--border-radius)',
          border: '1px solid rgba(245,158,11,0.2)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)',
        }}>
          <strong style={{ color: 'var(--accent-warning)' }}>◆ Decision — Evaluation Gate:</strong>{' '}
          If model accuracy passes threshold (MAPE &lt; 10%) → proceed to Deployment.
          Otherwise → return to Feature Store for re-engineering.
        </div>
      </div>

      {/* ---- ANALYSIS FLOW ---- */}
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🔬 Analysis Flow</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>ML development lifecycle</span>
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', lineHeight: 1.6 }}>
          Step-by-step analysis workflow from raw data ingestion through to production deployment.
          First 3 steps (Raw Data → EDA → Cleaning) are completed; remaining steps are queued.
        </p>
        <AnalysisFlowDiagram />

        {/* Stage progress */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
          {[
            { label: 'Data Preparation', steps: 'Raw Data → EDA → Cleaning', status: 'Complete', color: 'var(--accent-success)', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Modelling', steps: 'Feature Eng. → Model Select → Training', status: 'In Progress', color: 'var(--accent-primary)', bg: 'rgba(59,130,246,0.08)' },
            { label: 'Release', steps: 'Validation → Testing → Production', status: 'Upcoming', color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
          ].map((phase, i) => (
            <div key={i} style={{
              padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--border-radius)',
              background: phase.bg, border: `1px solid ${phase.color}33`,
            }}>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: phase.color, marginBottom: 2 }}>{phase.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>{phase.steps}</div>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                background: `${phase.color}22`, color: phase.color,
              }}>{phase.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- DOCUMENTATION SUITE (existing) ---- */}
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📚 Documentation Suite</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Click any doc to view / generate</span>
        </div>
        <div className="doc-links">
          {DOC_TYPES.map((doc) => (
            <div key={doc.type} className="doc-link-card" title={doc.description}>
              <div className="doc-link-icon">{doc.icon}</div>
              <span className="doc-link-type">{doc.type}</span>
              <div className="doc-link-title">{doc.title}</div>
              <div style={{ fontSize: '10px', color: 'var(--accent-success)', fontWeight: 600 }}>📄 Available</div>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📋 Documentation Index</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Document</th><th>Type</th><th>Status</th><th>Version</th><th>Last Updated</th></tr>
            </thead>
            <tbody>
              {DOC_TYPES.map((doc, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{doc.icon}</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{doc.title}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{doc.description.slice(0, 60)}…</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="test-case-tag">{doc.type}</span></td>
                  <td><span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-success)', fontWeight: 600 }}>✓ Published</span></td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>v{1 + i * 0}.{i % 3}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>2025-04-{(10 + i).toString().padStart(2, '0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🚧 Coming Soon</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          {COMING_SOON.map((item, i) => (
            <div key={i} style={{
              padding: '8px 14px', borderRadius: 'var(--border-radius)',
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
              fontSize: 'var(--font-size-xs)'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--accent-warning)' }}>{item.label}</div>
              <div style={{ color: 'var(--text-muted)' }}>ETA: {item.eta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
