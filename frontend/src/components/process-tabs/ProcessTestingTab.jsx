import { useState } from 'react';
import '../../styles/workbench.css';

function fmt(d) {
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ProcessTestingTab({ process }) {
  const tests = process.testCases || [];
  const [testStates, setTestStates] = useState(() => Object.fromEntries(tests.map((_, i) => [i, null])));
  const [testLog, setTestLog] = useState([]);
  const [runningAll, setRunningAll] = useState(false);

  const passed = tests.filter((t) => t.status === 'pass').length;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const pending = tests.filter((t) => t.status === 'pending').length;
  const positive = tests.filter((t) => t.type === 'positive');
  const negative = tests.filter((t) => t.type === 'negative');
  const manual = tests.filter((t) => t.type === 'manual');

  const statusIcon = { pass: '✓', fail: '✗', pending: '⏳' };

  function addLog(name, msg, type = 'info') {
    setTestLog((prev) => [...prev, { time: fmt(new Date()), name, msg, type }]);
  }

  async function runTest(idx) {
    const t = tests[idx];
    setTestStates((prev) => ({ ...prev, [idx]: 'running' }));
    addLog(t.name, 'Executing test case…', 'info');
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1000));
    const success = t.status === 'pass' || (t.status === 'pending' && Math.random() > 0.2);
    setTestStates((prev) => ({ ...prev, [idx]: success ? 'pass' : 'fail' }));
    addLog(t.name, success ? `PASS — ${t.expected}` : `FAIL — expected: ${t.expected}`, success ? 'success' : 'error');
    return success;
  }

  async function runAllTests() {
    setRunningAll(true);
    setTestLog([]);
    addLog('Suite', 'Starting full test run…', 'info');
    let passCount = 0;
    for (let i = 0; i < tests.length; i++) {
      const ok = await runTest(i);
      if (ok) passCount++;
    }
    addLog('Suite', `Test run complete — ${passCount}/${tests.length} passed`, passCount === tests.length ? 'success' : 'error');
    setRunningAll(false);
  }

  function resetTests() {
    setTestStates(Object.fromEntries(tests.map((_, i) => [i, null])));
    setTestLog([]);
  }

  const runCount = Object.values(testStates).filter((s) => s !== null).length;
  const runPassed = Object.values(testStates).filter((s) => s === 'pass').length;

  function renderTests(list, label) {
    const icon = label === 'Positive' ? '✅' : label === 'Negative' ? '❌' : '🔧';
    return (
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon} {label} Test Cases
          <span style={{ fontSize: 'var(--font-size-xs)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 10 }}>{list.length}</span>
        </div>
        {list.map((t, i) => {
          const globalIdx = tests.indexOf(t);
          const runState = testStates[globalIdx];
          const displayStatus = runState || t.status;
          return (
            <div key={i} className="test-case-card">
              <div className={`test-case-status-icon ${displayStatus === 'running' ? 'skip' : displayStatus}`}>
                {displayStatus === 'running' ? '⏳' : statusIcon[displayStatus] || '○'}
              </div>
              <div className="test-case-content">
                <div className="test-case-name">{t.name}</div>
                <div className="test-case-description">Expected: {t.expected}</div>
                <div className="test-case-meta">
                  <span className="test-case-tag">{t.type}</span>
                  <span className="test-case-tag" style={{ color: displayStatus === 'pass' ? 'var(--accent-success)' : displayStatus === 'fail' ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                    {displayStatus}
                  </span>
                </div>
              </div>
              <button
                onClick={() => runTest(globalIdx)}
                disabled={runState === 'running' || runningAll}
                style={{
                  padding: '4px 10px', borderRadius: 'var(--border-radius-sm)', border: 'none',
                  background: runState === 'running' ? 'var(--bg-hover)' : 'var(--accent-primary)',
                  color: runState === 'running' ? 'var(--text-muted)' : '#fff',
                  fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: runState === 'running' ? 'default' : 'pointer',
                  flexShrink: 0,
                }}
              >
                {runState === 'running' ? '⏳' : runState ? '↺' : '▶ Run'}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

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
          <div className="kpi-value" style={{ color: 'var(--accent-success)' }}>{runCount > 0 ? runPassed : passed}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent red" />
          <div className="kpi-label">Failed</div>
          <div className="kpi-value" style={{ color: 'var(--accent-danger)' }}>{runCount > 0 ? runCount - runPassed : failed}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent amber" />
          <div className="kpi-label">Pending</div>
          <div className="kpi-value" style={{ color: 'var(--accent-warning)' }}>{runCount > 0 ? tests.length - runCount : pending}</div>
        </div>
      </div>

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🧪 Test Runner</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ fontSize: 'var(--font-size-xs)' }} onClick={runAllTests} disabled={runningAll}>
              {runningAll ? '⏳ Running…' : '▶ Run All Tests'}
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 'var(--font-size-xs)' }} onClick={resetTests}>Reset</button>
          </div>
        </div>

        {runCount > 0 && (
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <div style={{ background: 'var(--bg-hover)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{
                width: `${(runPassed / tests.length) * 100}%`,
                height: '100%',
                background: runPassed === runCount ? 'var(--accent-success)' : 'var(--accent-danger)',
                transition: 'width 0.3s', borderRadius: 4,
              }} />
            </div>
            <div style={{ marginTop: 4, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'right' }}>
              {runPassed}/{tests.length} passed ({((runPassed / tests.length) * 100).toFixed(0)}%)
            </div>
          </div>
        )}
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
              <tr><th>#</th><th>Test Name</th><th>Type</th><th>Expected</th><th>Run Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {tests.map((t, i) => {
                const runState = testStates[i];
                const displayStatus = runState || t.status;
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{t.name}</td>
                    <td><span className="test-case-tag">{t.type}</span></td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{t.expected}</td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: displayStatus === 'pass' ? 'var(--accent-success)' : displayStatus === 'fail' ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                        {displayStatus === 'running' ? '⏳' : statusIcon[displayStatus] || '○'} {displayStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => runTest(i)}
                        disabled={runState === 'running' || runningAll}
                        style={{ padding: '2px 8px', border: '1px solid var(--border-color)', borderRadius: 4, background: 'var(--bg-card)', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}
                      >
                        {runState === 'running' ? '⏳' : runState ? '↺' : '▶'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Execution Log */}
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📋 Execution Log</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{testLog.length} entries</span>
        </div>
        {testLog.length === 0 ? (
          <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
            No test runs yet. Click "Run All Tests" or run individual tests.
          </div>
        ) : (
          <div className="tx-log">
            {testLog.map((entry, i) => (
              <div key={i} className="tx-log-entry">
                <span className="tx-log-time">{entry.time}</span>
                <span className="tx-log-step">[{entry.name}]</span>
                <span className={`tx-log-msg ${entry.type}`}>{entry.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Report Summary */}
      {runCount > 0 && (
        <div className="content-section">
          <div className="content-section-header">
            <span className="content-section-title">📄 Test Report Summary</span>
            <button
              className="btn btn-secondary"
              style={{ fontSize: 'var(--font-size-xs)' }}
              onClick={() => {
                const lines = [
                  `Test Report — ${process.name}`,
                  `Generated: ${new Date().toISOString()}`,
                  `Total: ${tests.length} | Passed: ${runPassed} | Failed: ${runCount - runPassed}`,
                  '',
                  ...tests.map((t, i) => `[${testStates[i] || t.status}] ${t.name} — ${t.expected}`),
                ];
                navigator.clipboard?.writeText(lines.join('\n'));
                alert('Report copied to clipboard!');
              }}
            >
              📋 Copy Report
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)' }}>
            {[
              { label: 'Pass Rate', value: `${((runPassed / tests.length) * 100).toFixed(1)}%`, color: 'var(--accent-success)' },
              { label: 'Tests Run', value: `${runCount}/${tests.length}`, color: 'var(--text-primary)' },
              { label: 'Status', value: runPassed === runCount ? 'PASS' : 'PARTIAL FAIL', color: runPassed === runCount ? 'var(--accent-success)' : 'var(--accent-danger)' },
            ].map((s) => (
              <div key={s.label} style={{ padding: 'var(--spacing-md)', textAlign: 'center', background: 'var(--bg-hover)', borderRadius: 'var(--border-radius-lg)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
