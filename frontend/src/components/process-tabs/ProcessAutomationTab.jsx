const MANUAL_STEPS = [
  { step: 'Data Collection', manual: 'Export from ERP manually to Excel', automated: 'Automated ETL pipeline runs daily at 6am', status: 'automated' },
  { step: 'Data Cleaning', manual: 'Manual data validation in spreadsheet', automated: 'Great Expectations data quality checks', status: 'automated' },
  { step: 'Analysis', manual: 'Analyst runs pivot tables and formulas', automated: 'ML model scores automatically', status: 'automated' },
  { step: 'Review', manual: 'Manager reviews weekly in meeting', automated: 'Exception-based alerts trigger review', status: 'hybrid' },
  { step: 'Decision', manual: 'Manual decision by team lead', automated: 'Auto-approved within thresholds; escalation above', status: 'hybrid' },
  { step: 'Action', manual: 'Manual entry into ERP system', automated: 'API push to ERP with confirmation', status: 'automated' },
  { step: 'Reporting', manual: 'Manual Excel report prepared weekly', automated: 'Real-time dashboard auto-updated', status: 'automated' },
  { step: 'Audit', manual: 'Annual manual audit', automated: 'Continuous automated audit trail', status: 'automated' },
];

const TODOS = [
  { task: 'Connect to live ERP data feed', priority: 'High', status: 'done', owner: 'Data Engineering' },
  { task: 'Deploy model to production environment', priority: 'High', status: 'done', owner: 'ML Ops' },
  { task: 'Set up monitoring and alerting', priority: 'High', status: 'done', owner: 'DevOps' },
  { task: 'Build user-facing dashboard', priority: 'Medium', status: 'in-progress', owner: 'Frontend' },
  { task: 'Integrate with ERP for auto-action', priority: 'Medium', status: 'in-progress', owner: 'Integration' },
  { task: 'Train end users on new system', priority: 'Medium', status: 'pending', owner: 'Change Mgmt' },
  { task: 'Set up n8n workflow automation', priority: 'Low', status: 'pending', owner: 'Automation' },
  { task: 'Document SOPs for automated process', priority: 'Low', status: 'pending', owner: 'Business Analyst' },
];

const statusColor = { done: 'var(--accent-success)', 'in-progress': 'var(--accent-warning)', pending: 'var(--text-muted)' };
const statusIcon = { done: '✓', 'in-progress': '⏳', pending: '○' };
const stepColor = { automated: 'var(--accent-success)', hybrid: 'var(--accent-warning)', manual: 'var(--accent-danger)' };

export default function ProcessAutomationTab({ process }) {
  const automated = MANUAL_STEPS.filter((s) => s.status === 'automated').length;
  const hybrid = MANUAL_STEPS.filter((s) => s.status === 'hybrid').length;
  const manual = MANUAL_STEPS.filter((s) => s.status === 'manual').length;

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-accent green" />
          <div className="kpi-label">Automated Steps</div>
          <div className="kpi-value">{automated}</div>
          <div className="kpi-change positive"><span className="kpi-change-arrow">↑</span> {Math.round(automated / MANUAL_STEPS.length * 100)}% automation</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent amber" />
          <div className="kpi-label">Hybrid Steps</div>
          <div className="kpi-value">{hybrid}</div>
          <div className="kpi-change neutral"><span className="kpi-change-label">Human in loop</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent red" />
          <div className="kpi-label">Manual Steps</div>
          <div className="kpi-value">{manual}</div>
          <div className="kpi-change neutral"><span className="kpi-change-label">To be automated</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent blue" />
          <div className="kpi-label">Pipeline Status</div>
          <div className="kpi-value" style={{ fontSize: 'var(--font-size-base)', color: 'var(--accent-success)' }}>Active</div>
          <div className="kpi-change positive">n8n + ERP integrated</div>
        </div>
      </div>

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🔄 Manual vs Automated — Step Comparison</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Process Step</th><th>Before (Manual)</th><th>After (Automated)</th><th>Status</th></tr>
            </thead>
            <tbody>
              {MANUAL_STEPS.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.step}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)' }}>⚠️ {s.manual}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-success)' }}>✅ {s.automated}</td>
                  <td>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: stepColor[s.status] }}>
                      ● {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">✅ To-Do Tasks</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            {TODOS.filter((t) => t.status === 'done').length}/{TODOS.length} completed
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          {TODOS.map((t, i) => (
            <div key={i} className="test-case-card" style={{ padding: '10px 16px' }}>
              <div className={`test-case-status-icon ${t.status === 'done' ? 'pass' : t.status === 'in-progress' ? 'skip' : 'skip'}`}>
                {statusIcon[t.status]}
              </div>
              <div className="test-case-content">
                <div className="test-case-name" style={{ textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {t.task}
                </div>
                <div className="test-case-meta">
                  <span className="test-case-tag">{t.priority} Priority</span>
                  <span className="test-case-tag">{t.owner}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: statusColor[t.status] }}>{t.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
