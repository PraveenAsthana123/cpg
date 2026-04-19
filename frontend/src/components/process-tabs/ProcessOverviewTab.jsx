import { useState, useRef } from 'react';
import '../../styles/workbench.css';

const PIPELINE_STEPS = [
  { id: 'data-input', label: 'Data Input', icon: '📥', desc: 'Load raw data from source system or custom path.', output: 'Raw dataset loaded — {rows} rows × {cols} columns' },
  { id: 'eda', label: 'EDA', icon: '🔍', desc: 'Exploratory data analysis: shape, distributions, correlations.', output: 'EDA complete — 3 high-missing columns flagged, skewness detected' },
  { id: 'preprocessing', label: 'Preprocessing', icon: '🧹', desc: 'Clean nulls, remove duplicates, fix data types.', output: 'Preprocessing done — 0 nulls, 0 duplicates, types validated' },
  { id: 'feature-eng', label: 'Feature Eng.', icon: '🛠️', desc: 'Create lag features, rolling stats, one-hot encoding.', output: 'Feature engineering done — 12 new features added (33 → 45 total)' },
  { id: 'model-select', label: 'Model Select', icon: '🧠', desc: 'Auto-select best model from candidates.', output: 'XGBoost selected — highest CV score (0.91 AUROC)' },
  { id: 'training', label: 'Training', icon: '🏋️', desc: 'Train selected model with tuned hyperparameters.', output: 'Training complete — 50 epochs, best val loss: 0.082' },
  { id: 'evaluation', label: 'Evaluation', icon: '📊', desc: 'Score on holdout set, generate metrics and charts.', output: 'Accuracy: 92.4% | F1: 0.914 | AUC: 0.963' },
  { id: 'output', label: 'Output', icon: '📤', desc: 'Export predictions, push to ERP/dashboard.', output: 'Predictions exported to /output/predictions_v1.csv (750K rows)' },
];

function fmt(d) {
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ProcessOverviewTab({ process, dept }) {
  const [stepStates, setStepStates] = useState(() => Object.fromEntries(PIPELINE_STEPS.map((s) => [s.id, 'pending'])));
  const [expandedStep, setExpandedStep] = useState(null);
  const [txLog, setTxLog] = useState([]);
  const [runningAll, setRunningAll] = useState(false);
  const runAllRef = useRef(false);

  function addLog(step, msg, type = 'info') {
    setTxLog((prev) => [...prev, { time: fmt(new Date()), step, msg, type }]);
  }

  async function runStep(stepId) {
    const step = PIPELINE_STEPS.find((s) => s.id === stepId);
    if (!step) return;
    setStepStates((prev) => ({ ...prev, [stepId]: 'running' }));
    addLog(step.label, `Starting ${step.label}…`, 'info');
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1000));
    const success = Math.random() > 0.05;
    const newStatus = success ? 'complete' : 'error';
    setStepStates((prev) => ({ ...prev, [stepId]: newStatus }));
    addLog(step.label, success ? step.output : `Error in ${step.label} — check data path`, success ? 'success' : 'error');
    return success;
  }

  async function runAll() {
    if (runningAll) return;
    setRunningAll(true);
    runAllRef.current = true;
    setStepStates(Object.fromEntries(PIPELINE_STEPS.map((s) => [s.id, 'pending'])));
    setTxLog([]);
    addLog('Pipeline', 'Starting full pipeline run…', 'info');
    for (const step of PIPELINE_STEPS) {
      if (!runAllRef.current) break;
      const ok = await runStep(step.id);
      if (!ok) { addLog('Pipeline', 'Pipeline halted due to error.', 'error'); break; }
    }
    if (runAllRef.current) addLog('Pipeline', 'All steps complete!', 'success');
    setRunningAll(false);
    runAllRef.current = false;
  }

  function resetAll() {
    runAllRef.current = false;
    setStepStates(Object.fromEntries(PIPELINE_STEPS.map((s) => [s.id, 'pending'])));
    setTxLog([]);
    setRunningAll(false);
  }

  const completedCount = Object.values(stepStates).filter((s) => s === 'complete').length;
  const hasError = Object.values(stepStates).includes('error');

  return (
    <div>
      {/* Process description */}
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

      {/* Manual Pipeline Runner */}
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🚀 Manual Pipeline Runner</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{completedCount}/{PIPELINE_STEPS.length} steps</span>
            <button
              className="btn btn-primary"
              style={{ fontSize: 'var(--font-size-xs)', padding: '5px 14px' }}
              onClick={runAll}
              disabled={runningAll}
            >
              {runningAll ? '⏳ Running…' : '▶ Run All Steps'}
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 'var(--font-size-xs)', padding: '5px 10px' }} onClick={resetAll}>Reset</button>
          </div>
        </div>

        {/* Progress bar */}
        {completedCount > 0 && (
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <div style={{ background: 'var(--bg-hover)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{
                width: `${(completedCount / PIPELINE_STEPS.length) * 100}%`,
                height: '100%',
                background: hasError ? 'var(--accent-danger)' : 'var(--accent-success)',
                transition: 'width 0.3s', borderRadius: 4,
              }} />
            </div>
          </div>
        )}

        {/* Pipeline visual */}
        <div className="pipeline-steps">
          {PIPELINE_STEPS.map((step, idx) => {
            const status = stepStates[step.id];
            return (
              <div key={step.id} className="pipeline-step-wrapper">
                <div
                  className={`pipeline-step status-${status}`}
                  onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                >
                  <div className="pipeline-step-icon-wrap">
                    <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                    <div className="pipeline-step-status-dot" />
                  </div>
                  <div className="pipeline-step-label">
                    <div>{`${idx + 1}. ${step.label}`}</div>
                  </div>
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div className={`pipeline-connector${status === 'complete' ? ' done' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Expanded step detail */}
        {expandedStep && (() => {
          const step = PIPELINE_STEPS.find((s) => s.id === expandedStep);
          const status = stepStates[expandedStep];
          return (
            <div className={`pipeline-step-detail status-${status}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{step.icon} {step.label}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                    background: status === 'complete' ? 'rgba(16,185,129,0.1)' : status === 'running' ? 'rgba(59,130,246,0.1)' : status === 'error' ? 'rgba(239,68,68,0.1)' : 'var(--bg-hover)',
                    color: status === 'complete' ? 'var(--accent-success)' : status === 'running' ? 'var(--accent-primary)' : status === 'error' ? 'var(--accent-danger)' : 'var(--text-muted)',
                  }}>
                    {status}
                  </span>
                  <button
                    className={`pipeline-run-btn ${status === 'running' ? 'running' : status === 'complete' ? 'complete' : status === 'error' ? 'error' : 'run'}`}
                    disabled={status === 'running' || runningAll}
                    onClick={() => runStep(step.id)}
                  >
                    {status === 'running' ? '⏳ Running…' : status === 'complete' ? '✓ Re-run' : status === 'error' ? '↺ Retry' : '▶ Run'}
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 8 }}>{step.desc}</p>
              {status === 'complete' && (
                <div style={{ padding: '6px 10px', background: 'rgba(16,185,129,0.06)', borderRadius: 4, fontSize: 'var(--font-size-xs)', color: 'var(--accent-success)', fontWeight: 500 }}>
                  ✓ {step.output}
                </div>
              )}
              {status === 'error' && (
                <div style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.06)', borderRadius: 4, fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', fontWeight: 500 }}>
                  ✗ Error in {step.label} — check data path and logs below
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Transaction Log */}
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📋 Transaction Log</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{txLog.length} entries</span>
        </div>
        {txLog.length === 0 ? (
          <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
            No actions yet. Click "Run All Steps" or run individual steps.
          </div>
        ) : (
          <div className="tx-log">
            {txLog.map((entry, i) => (
              <div key={i} className="tx-log-entry">
                <span className="tx-log-time">{entry.time}</span>
                <span className="tx-log-step">[{entry.step}]</span>
                <span className={`tx-log-msg ${entry.type}`}>{entry.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Original Before/After */}
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

      {/* Original Process Flow */}
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
    </div>
  );
}
