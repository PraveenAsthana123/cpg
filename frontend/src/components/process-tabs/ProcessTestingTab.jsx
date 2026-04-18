export default function ProcessTestingTab({ process }) {
  const tests = process.testCases || [];
  const passed = tests.filter((t) => t.status === 'pass').length;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const pending = tests.filter((t) => t.status === 'pending').length;
  const positive = tests.filter((t) => t.type === 'positive');
  const negative = tests.filter((t) => t.type === 'negative');
  const manual = tests.filter((t) => t.type === 'manual');

  const statusIcon = { pass: '✓', fail: '✗', pending: '⏳' };

  const renderTests = (list, label) => (
    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {label === 'Positive' ? '✅' : label === 'Negative' ? '❌' : '🔧'} {label} Test Cases
        <span style={{ fontSize: 'var(--font-size-xs)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 10 }}>{list.length}</span>
      </div>
      {list.map((t, i) => (
        <div key={i} className="test-case-card">
          <div className={`test-case-status-icon ${t.status}`}>{statusIcon[t.status]}</div>
          <div className="test-case-content">
            <div className="test-case-name">{t.name}</div>
            <div className="test-case-description">Expected: {t.expected}</div>
            <div className="test-case-meta">
              <span className="test-case-tag">{t.type}</span>
              <span className="test-case-tag" style={{ color: t.status === 'pass' ? 'var(--accent-success)' : t.status === 'fail' ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                {t.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="kpi-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="kpi-card">
          <div className="kpi-card-accent blue" />
          <div className="kpi-label">Total Tests</div>
          <div className="kpi-value">{tests.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent green" />
          <div className="kpi-label">Passed</div>
          <div className="kpi-value" style={{ color: 'var(--accent-success)' }}>{passed}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent red" />
          <div className="kpi-label">Failed</div>
          <div className="kpi-value" style={{ color: 'var(--accent-danger)' }}>{failed}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent amber" />
          <div className="kpi-label">Pending</div>
          <div className="kpi-value" style={{ color: 'var(--accent-warning)' }}>{pending}</div>
        </div>
      </div>

      {positive.length > 0 && renderTests(positive, 'Positive')}
      {negative.length > 0 && renderTests(negative, 'Negative')}
      {manual.length > 0 && renderTests(manual, 'Manual')}

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📊 All Test Cases</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Test Name</th><th>Type</th><th>Expected</th><th>Status</th></tr>
            </thead>
            <tbody>
              {tests.map((t, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{t.name}</td>
                  <td><span className="test-case-tag">{t.type}</span></td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{t.expected}</td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: t.status === 'pass' ? 'var(--accent-success)' : t.status === 'fail' ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                      {statusIcon[t.status]} {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
