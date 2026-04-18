const GOV_CARDS = [
  {
    icon: '🔍', title: 'Explainability (XAI)',
    description: 'SHAP values computed for every model prediction. Feature importance ranked and available via API. Global and local explanations provided. Business-friendly explanations auto-generated.',
    status: 'compliant', statusLabel: 'XAI Compliant',
    bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.15)',
    details: ['SHAP TreeExplainer for tree models', 'KernelSHAP for complex models', 'LIME for local explanations', 'Feature importance dashboard'],
  },
  {
    icon: '📊', title: 'Interpretability',
    description: 'Model decisions can be traced back to input features. Decision paths available for tree-based models. Coefficient tables for linear models.',
    status: 'compliant', statusLabel: 'Interpretable',
    bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.15)',
    details: ['Decision tree visualization', 'Linear model coefficient table', 'Partial dependence plots', 'ICE plots available'],
  },
  {
    icon: '⚖️', title: 'Responsible AI',
    description: 'Bias detection run on protected attributes. Fairness metrics computed across demographic segments. Regular bias audits scheduled quarterly.',
    status: 'compliant', statusLabel: 'Bias Checked',
    bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)',
    details: ['Disparate impact analysis', 'Equal opportunity check', 'Calibration by segment', 'Quarterly bias audit'],
  },
  {
    icon: '📋', title: 'Compliance AI',
    description: 'Model usage compliant with GDPR, CCPA, and internal data governance policies. Data minimization applied. Retention policies enforced.',
    status: 'compliant', statusLabel: 'Regulation Compliant',
    bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)',
    details: ['GDPR data minimization', 'CCPA consumer rights', 'Data retention policy', 'PII masking applied'],
  },
  {
    icon: '🏛️', title: 'Governance AI',
    description: 'Model reviewed and approved by AI Governance Committee. Change log maintained. Version control enforced. Rollback procedure tested.',
    status: 'compliant', statusLabel: 'Governance Approved',
    bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.15)',
    details: ['Model registry entry', 'Approval workflow', 'Version history', 'Rollback tested'],
  },
  {
    icon: '🐛', title: 'Debug AI',
    description: 'Model monitored for PSI/CSI drift daily. Automated retraining triggered if drift detected. Error analysis performed monthly. Shadow model running.',
    status: 'review', statusLabel: 'Monitoring Active',
    bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)',
    details: ['PSI monitoring: daily', 'CSI monitoring: weekly', 'Shadow model: active', 'Auto-retrain: enabled'],
  },
];

export default function ProcessGovernanceTab({ process }) {
  return (
    <div>
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🏛️ AI Governance Framework</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-success)', fontWeight: 600 }}>5/6 Compliant</span>
        </div>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', lineHeight: 1.6 }}>
          All AI models in this process are subject to the CPG AI Governance Framework covering explainability,
          fairness, compliance, and continuous monitoring.
        </p>

        <div className="governance-grid">
          {GOV_CARDS.map((card, i) => (
            <div key={i} className="governance-card" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{card.icon}</span>
                <div className="governance-card-title">{card.title}</div>
              </div>
              <div className="governance-card-description">{card.description}</div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {card.details.map((d, j) => (
                  <li key={j} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{d}</li>
                ))}
              </ul>
              <div className="governance-status-row">
                <div className={`governance-status-dot ${card.status}`} />
                <span style={{ fontSize: 'var(--font-size-xs)', color: card.status === 'compliant' ? 'var(--accent-success)' : 'var(--accent-warning)', fontWeight: 500 }}>
                  {card.statusLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📋 Governance Checklist</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Requirement</th><th>Category</th><th>Status</th><th>Last Verified</th></tr>
            </thead>
            <tbody>
              {[
                ['Model approved by AI Committee', 'Governance', 'pass', '2025-03-15'],
                ['SHAP explanations available', 'Explainability', 'pass', '2025-04-01'],
                ['Bias audit completed', 'Fairness', 'pass', '2025-02-28'],
                ['GDPR compliance confirmed', 'Compliance', 'pass', '2025-03-01'],
                ['Data lineage documented', 'Data Gov', 'pass', '2025-03-20'],
                ['PSI monitoring active', 'Monitoring', 'pass', '2025-04-18'],
                ['Rollback procedure tested', 'Risk', 'pass', '2025-03-10'],
                ['Model card published', 'Documentation', 'pending', 'In progress'],
              ].map(([req, cat, status, date], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{req}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)' }}><span className="test-case-tag">{cat}</span></td>
                  <td>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: status === 'pass' ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                      {status === 'pass' ? '✓ Pass' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
