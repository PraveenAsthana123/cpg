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

export default function ProcessDocsTab({ process, dept }) {
  return (
    <div>
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
