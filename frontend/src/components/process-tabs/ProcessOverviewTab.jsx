export default function ProcessOverviewTab({ process, dept }) {
  return (
    <div>
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📋 Process Description</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {process.aiTypes.map((t) => (
              <span key={t} className={`ai-badge ai-badge-${t.toLowerCase().replace(' ', '')}`}>{t}</span>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{process.description}</p>
      </div>

      <div className="process-flow">
        <div className="process-flow-step">
          <div className="process-card input-step">
            <div className="process-card-label">Input</div>
            <div className="process-card-title">Data Inputs</div>
            <ul className="process-card-items">
              {process.inputs.split(',').map((inp, i) => (
                <li key={i}>{inp.trim()}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="process-flow-step">
          <div className="process-card process-step">
            <div className="process-card-label">Process</div>
            <div className="process-card-title">AI Processing</div>
            <ul className="process-card-items">
              {process.dataFlow.process.split('→').map((step, i) => (
                <li key={i}>{step.trim()}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="process-flow-step">
          <div className="process-card output-step">
            <div className="process-card-label">Output</div>
            <div className="process-card-title">Outputs</div>
            <ul className="process-card-items">
              {process.outputs.split(',').map((out, i) => (
                <li key={i}>{out.trim()}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="before-after-grid">
        <div className="before-after-card before-card">
          <div className="before-after-header">⚠️ Before AI (Pain Points)</div>
          <div className="before-after-body">
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{process.painPoints}</p>
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 6, fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)' }}>
              {process.dataFlow.before}
            </div>
          </div>
        </div>
        <div className="before-after-card after-card">
          <div className="before-after-header">✅ After AI (Outcome)</div>
          <div className="before-after-body">
            <div style={{ marginBottom: 8, padding: '8px 12px', background: 'rgba(16,185,129,0.06)', borderRadius: 6, fontSize: 'var(--font-size-xs)', color: 'var(--accent-success)' }}>
              {process.dataFlow.after}
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 6 }}>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>KPIs</div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{process.kpi}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
