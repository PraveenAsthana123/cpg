import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
} from 'recharts';
import '../../styles/workbench.css';

/* ---- Default hyperparams per algorithm ---- */
const HYPERPARAM_PRESETS = {
  'XGBoost': [
    { name: 'n_estimators', default: 100, type: 'int', range: '10–1000', desc: 'Number of boosting rounds' },
    { name: 'max_depth', default: 6, type: 'int', range: '1–15', desc: 'Max tree depth' },
    { name: 'learning_rate', default: 0.1, type: 'float', range: '0.001–1.0', desc: 'Boosting learning rate (eta)' },
    { name: 'min_child_weight', default: 1, type: 'int', range: '1–20', desc: 'Minimum sum of instance weight' },
    { name: 'subsample', default: 0.8, type: 'float', range: '0.1–1.0', desc: 'Fraction of samples per tree' },
    { name: 'colsample_bytree', default: 0.8, type: 'float', range: '0.1–1.0', desc: 'Fraction of features per tree' },
    { name: 'reg_alpha', default: 0.0, type: 'float', range: '0–100', desc: 'L1 regularization' },
    { name: 'reg_lambda', default: 1.0, type: 'float', range: '0–100', desc: 'L2 regularization' },
  ],
  'LightGBM': [
    { name: 'num_leaves', default: 31, type: 'int', range: '2–256', desc: 'Max number of leaves in tree' },
    { name: 'max_depth', default: -1, type: 'int', range: '-1 to 15', desc: '-1 means no limit' },
    { name: 'learning_rate', default: 0.1, type: 'float', range: '0.001–1.0', desc: 'Gradient boosting learning rate' },
    { name: 'n_estimators', default: 200, type: 'int', range: '10–2000', desc: 'Number of trees' },
    { name: 'min_child_samples', default: 20, type: 'int', range: '1–100', desc: 'Min samples in leaf' },
    { name: 'feature_fraction', default: 0.9, type: 'float', range: '0.1–1.0', desc: 'Fraction of features per iteration' },
  ],
  'LSTM': [
    { name: 'units', default: 128, type: 'int', range: '16–512', desc: 'Number of LSTM units' },
    { name: 'dropout', default: 0.2, type: 'float', range: '0.0–0.5', desc: 'Dropout rate for regularization' },
    { name: 'epochs', default: 50, type: 'int', range: '10–500', desc: 'Training epochs' },
    { name: 'batch_size', default: 32, type: 'int', range: '8–256', desc: 'Batch size for training' },
    { name: 'sequence_len', default: 12, type: 'int', range: '1–60', desc: 'Input sequence length' },
    { name: 'optimizer', default: 'adam', type: 'str', range: 'adam/sgd/rmsprop', desc: 'Gradient descent optimizer' },
  ],
  'Random Forest': [
    { name: 'n_estimators', default: 100, type: 'int', range: '10–500', desc: 'Number of trees in forest' },
    { name: 'max_depth', default: 10, type: 'int', range: '1–50', desc: 'Max depth per tree' },
    { name: 'min_samples_split', default: 2, type: 'int', range: '2–20', desc: 'Min samples to split node' },
    { name: 'min_samples_leaf', default: 1, type: 'int', range: '1–10', desc: 'Min samples in leaf' },
    { name: 'max_features', default: 'sqrt', type: 'str', range: 'sqrt/log2/None', desc: 'Features to consider per split' },
  ],
  'Prophet': [
    { name: 'seasonality_mode', default: 'multiplicative', type: 'str', range: 'additive/multiplicative', desc: 'Seasonality mode' },
    { name: 'changepoint_prior_scale', default: 0.05, type: 'float', range: '0.001–0.5', desc: 'Flexibility of trend changepoints' },
    { name: 'seasonality_prior_scale', default: 10.0, type: 'float', range: '0.1–100', desc: 'Seasonality regularization' },
    { name: 'n_changepoints', default: 25, type: 'int', range: '0–50', desc: 'Number of potential changepoints' },
  ],
};

function getHyperparams(algorithm) {
  for (const [key, params] of Object.entries(HYPERPARAM_PRESETS)) {
    if (algorithm && algorithm.includes(key)) return { key, params };
  }
  return { key: 'XGBoost', params: HYPERPARAM_PRESETS['XGBoost'] };
}

function generateLossCurve(epochs = 50) {
  let trainLoss = 1.2;
  let valLoss = 1.4;
  return Array.from({ length: epochs }, (_, i) => {
    trainLoss = Math.max(0.05, trainLoss * (0.93 + Math.random() * 0.04));
    valLoss = Math.max(0.08, valLoss * (0.94 + Math.random() * 0.04));
    return { epoch: i + 1, train: parseFloat(trainLoss.toFixed(4)), val: parseFloat(valLoss.toFixed(4)) };
  });
}

function generateMetrics(accuracy) {
  const base = accuracy / 100;
  return {
    accuracy: accuracy,
    precision: parseFloat((base * (0.95 + Math.random() * 0.08)).toFixed(3)),
    recall: parseFloat((base * (0.93 + Math.random() * 0.08)).toFixed(3)),
    f1: parseFloat((base * (0.94 + Math.random() * 0.07)).toFixed(3)),
    auc_roc: parseFloat((0.85 + Math.random() * 0.12).toFixed(3)),
    mape: parseFloat((4 + Math.random() * 6).toFixed(2)),
    rmse: parseFloat((150 + Math.random() * 200).toFixed(1)),
    mae: parseFloat((90 + Math.random() * 120).toFixed(1)),
  };
}

function ConfusionMatrix({ metrics }) {
  const tp = Math.floor(metrics.accuracy * 8.5);
  const tn = Math.floor(metrics.accuracy * 7.2);
  const fp = Math.floor((1 - metrics.precision) * 200 + 10);
  const fn = Math.floor((1 - metrics.recall) * 250 + 10);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 8 }}>Predicted →</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginRight: 8 }}>Actual ↓</div>
        <div className="confusion-matrix" style={{ gridTemplateColumns: 'auto auto auto', display: 'grid', gap: 4 }}>
          <div style={{ width: 64 }} />
          <div className="confusion-matrix-cell header">Positive</div>
          <div className="confusion-matrix-cell header">Negative</div>
          <div className="confusion-matrix-cell header">Positive</div>
          <div className="confusion-matrix-cell tp">
            <div className="cell-value">{tp}</div>
            <div className="cell-label">TP</div>
          </div>
          <div className="confusion-matrix-cell fn">
            <div className="cell-value">{fn}</div>
            <div className="cell-label">FN</div>
          </div>
          <div className="confusion-matrix-cell header">Negative</div>
          <div className="confusion-matrix-cell fp">
            <div className="cell-value">{fp}</div>
            <div className="cell-label">FP</div>
          </div>
          <div className="confusion-matrix-cell tn">
            <div className="cell-value">{tn}</div>
            <div className="cell-label">TN</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProcessModelsTab({ process }) {
  const models = process.models || [];
  const best = models[0];

  const [selectedModel, setSelectedModel] = useState(0);
  const [activeSection, setActiveSection] = useState('comparison');
  const [hyperValues, setHyperValues] = useState({});
  const [trainState, setTrainState] = useState('idle'); // idle | running | done
  const [trainProgress, setTrainProgress] = useState(0);
  const [selectedModels, setSelectedModels] = useState(() => new Set([0]));

  const { key: algoKey, params } = useMemo(() => getHyperparams(models[selectedModel]?.algorithm), [selectedModel, models]);

  const lossCurve = useMemo(() => generateLossCurve(50), []);
  const metrics = useMemo(() => generateMetrics(models[selectedModel]?.accuracy || 85), [selectedModel, models]);

  const radarData = best ? [
    { metric: 'Accuracy', value: best.accuracy },
    { metric: 'Speed', value: 85 },
    { metric: 'Interpretability', value: 70 },
    { metric: 'Scalability', value: 90 },
    { metric: 'Stability', value: 88 },
  ] : [];

  const benchmarks = [
    { name: 'This Model', value: metrics.accuracy, fill: 'var(--accent-success)' },
    { name: 'Baseline (naive)', value: Math.max(50, metrics.accuracy - 22), fill: 'var(--accent-danger)' },
    { name: 'Industry Avg', value: Math.max(60, metrics.accuracy - 12), fill: 'var(--accent-warning)' },
    { name: 'Best in Class', value: Math.min(99, metrics.accuracy + 3), fill: 'var(--accent-purple)' },
  ];

  function startTraining() {
    setTrainState('running');
    setTrainProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.floor(Math.random() * 8 + 3);
      if (p >= 100) { p = 100; clearInterval(iv); setTrainState('done'); }
      setTrainProgress(p);
    }, 200);
  }

  function toggleModelSelect(idx) {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) { if (next.size > 1) next.delete(idx); }
      else next.add(idx);
      return next;
    });
  }

  const sections = [
    { id: 'comparison', label: 'Model Comparison' },
    { id: 'hyperparams', label: 'Hyperparameters' },
    { id: 'training', label: 'Training Monitor' },
    { id: 'evaluation', label: 'Evaluation Report' },
    { id: 'ensemble', label: 'Ensemble' },
  ];

  return (
    <div>
      {/* Section Nav */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)',
              background: activeSection === s.id ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeSection === s.id ? '#fff' : 'var(--text-secondary)',
              fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ---- MODEL COMPARISON ---- */}
      {activeSection === 'comparison' && (
        <div>
          <div className="content-section">
            <div className="content-section-header">
              <span className="content-section-title">🧠 Model Selection Panel</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{models.length} models evaluated</span>
            </div>
            <div className="table-wrapper">
              <table className="model-comparison">
                <thead>
                  <tr>
                    <th>Select</th><th>Model</th><th>Algorithm</th><th>Type</th><th>Accuracy</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m, i) => (
                    <tr key={i} className={i === 0 ? 'best-model' : ''} style={{ cursor: 'pointer' }} onClick={() => { setSelectedModel(i); }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedModels.has(i)}
                          onChange={() => toggleModelSelect(i)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <div className="model-name-cell">
                          {i === 0 && <span className="best-model-crown">👑</span>}
                          {m.name}
                        </div>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{m.algorithm}</td>
                      <td>
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: 'var(--bg-hover)', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {m.algorithm?.includes('LSTM') || m.algorithm?.includes('Neural') ? 'DL' : 'ML'}
                        </span>
                      </td>
                      <td>
                        <div className="accuracy-bar">
                          <div className="accuracy-fill" style={{ width: `${Math.min(m.accuracy, 100)}px`, maxWidth: 80, background: i === 0 ? 'var(--accent-success)' : 'var(--accent-primary)' }} />
                          <span className="accuracy-value">{m.accuracy}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                          background: i === 0 ? 'rgba(16,185,129,0.1)' : selectedModels.has(i) ? 'rgba(59,130,246,0.1)' : 'var(--bg-hover)',
                          color: i === 0 ? 'var(--accent-success)' : selectedModels.has(i) ? 'var(--accent-primary)' : 'var(--text-muted)',
                        }}>
                          {i === 0 ? '✓ Selected' : selectedModels.has(i) ? '○ Ensemble' : 'Evaluated'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {best && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div className="content-section">
                <div className="content-section-header">
                  <span className="content-section-title">👑 Best Model — {best.name}</span>
                </div>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border-color)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <Radar dataKey="value" stroke="var(--accent-success)" fill="var(--accent-success)" fillOpacity={0.2} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="content-section">
                <div className="content-section-header">
                  <span className="content-section-title">💡 Model Justifications</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {models.map((m, i) => (
                    <div key={i} className="test-case-card" style={{ cursor: 'pointer', border: selectedModel === i ? '1px solid var(--accent-primary)' : undefined }} onClick={() => setSelectedModel(i)}>
                      <div className={`test-case-status-icon ${i === 0 ? 'pass' : 'skip'}`}>{i === 0 ? '✓' : '○'}</div>
                      <div className="test-case-content">
                        <div className="test-case-name">{m.name}</div>
                        <div className="test-case-description">{m.justification}</div>
                        <div className="test-case-meta">
                          <span className="test-case-tag">{m.algorithm}</span>
                          <span className="test-case-tag">{m.accuracy}% accuracy</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- HYPERPARAMETERS ---- */}
      {activeSection === 'hyperparams' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            {models.map((m, i) => (
              <button
                key={i}
                onClick={() => setSelectedModel(i)}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)',
                  background: selectedModel === i ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: selectedModel === i ? '#fff' : 'var(--text-secondary)',
                  fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {m.name}
              </button>
            ))}
          </div>

          {models[selectedModel] && (
            <div className="content-section">
              <div className="content-section-header">
                <span className="content-section-title">⚙️ {models[selectedModel].name} — Hyperparameters ({algoKey} defaults)</span>
              </div>
              <div className="table-wrapper">
                <table className="hyperparam-table">
                  <thead>
                    <tr><th>Parameter</th><th>Default</th><th>Current Value</th><th>Range</th><th>Description</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {params.map((p, i) => {
                      const key = `${selectedModel}-${p.name}`;
                      const currentVal = hyperValues[key] !== undefined ? hyperValues[key] : String(p.default);
                      const changed = currentVal !== String(p.default);
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>{p.name}</td>
                          <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>{p.default}</td>
                          <td>
                            <input
                              className="param-input"
                              value={currentVal}
                              onChange={(e) => setHyperValues((prev) => ({ ...prev, [key]: e.target.value }))}
                            />
                          </td>
                          <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{p.range}</td>
                          <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{p.desc}</td>
                          <td>{changed && <span className="badge-changed">Changed</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 'var(--spacing-sm)', display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const reset = {};
                    params.forEach((p) => { reset[`${selectedModel}-${p.name}`] = String(p.default); });
                    setHyperValues((prev) => ({ ...prev, ...reset }));
                  }}
                >
                  Reset to Defaults
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveSection('training')}>
                  ▶ Train with These Params
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- TRAINING MONITOR ---- */}
      {activeSection === 'training' && (
        <div>
          <div className="content-section">
            <div className="content-section-header">
              <span className="content-section-title">🏋️ Training Monitor — {models[selectedModel]?.name || 'Model'}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {trainState === 'idle' && <button className="btn btn-primary" onClick={startTraining}>▶ Start Training</button>}
                {trainState === 'running' && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-primary)', fontWeight: 600 }}>⏳ Training… {trainProgress}%</span>}
                {trainState === 'done' && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-success)', fontWeight: 600 }}>✓ Training Complete</span>}
              </div>
            </div>

            {trainState !== 'idle' && (
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ background: 'var(--bg-hover)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${trainProgress}%`, height: '100%', background: trainState === 'done' ? 'var(--accent-success)' : 'var(--accent-primary)', transition: 'width 0.2s', borderRadius: 4 }} />
                </div>
              </div>
            )}

            <div className="training-monitor" style={{ marginBottom: 'var(--spacing-md)' }}>
              <div className="training-monitor-header">
                <span className="training-monitor-title">📉 Loss Curve</span>
                <div className="training-monitor-stats">
                  <div className="training-stat">
                    <span className="training-stat-label">Train Loss</span>
                    <span className="training-stat-value">{lossCurve[lossCurve.length - 1].train}</span>
                  </div>
                  <div className="training-stat">
                    <span className="training-stat-label">Val Loss</span>
                    <span className="training-stat-value">{lossCurve[lossCurve.length - 1].val}</span>
                  </div>
                  <div className="training-stat">
                    <span className="training-stat-label">Epochs</span>
                    <span className="training-stat-value">50</span>
                  </div>
                </div>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainState === 'idle' ? [] : lossCurve.slice(0, Math.ceil(trainProgress / 2))} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: '#9ca3af' }} label={{ value: 'Epoch', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ background: '#1e1e3a', border: '1px solid #374151', borderRadius: 6, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                    <Line type="monotone" dataKey="train" name="Train Loss" stroke="#60a5fa" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="val" name="Val Loss" stroke="#f87171" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              {[
                { label: 'Training Time', value: trainState === 'done' ? `${(2.4 + Math.random() * 1.5).toFixed(1)}m` : '—' },
                { label: 'Memory Used', value: trainState === 'done' ? `${(1.2 + Math.random() * 0.8).toFixed(1)} GB` : '—' },
                { label: 'Best Epoch', value: trainState === 'done' ? `${Math.floor(Math.random() * 15 + 35)}` : '—' },
                { label: 'Early Stop', value: trainState === 'done' ? 'No' : '—' },
              ].map((s) => (
                <div key={s.label} style={{ padding: 'var(--spacing-sm)', background: 'var(--bg-hover)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {trainState === 'done' && (
              <div style={{ padding: 'var(--spacing-md)', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--border-radius)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>✓ Training complete.</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginLeft: 8 }}>
                  Model saved to <code>models/{models[selectedModel]?.name?.toLowerCase().replace(/\s/g, '_')}_v1.pkl</code>
                </span>
                <button className="btn btn-secondary" style={{ marginLeft: 12 }} onClick={() => setActiveSection('evaluation')}>View Evaluation →</button>
              </div>
            )}
          </div>

          {/* Gradient convergence viz */}
          <div className="content-section">
            <div className="content-section-header">
              <span className="content-section-title">📉 Gradient Descent Convergence</span>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={Array.from({ length: 30 }, (_, i) => ({ step: i + 1, grad: Math.max(0.001, 1.0 / (i * 0.8 + 1) + Math.random() * 0.05) }))}
                  margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="step" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="grad" name="Gradient Norm" stroke="var(--accent-warning)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ---- EVALUATION ---- */}
      {activeSection === 'evaluation' && (
        <div>
          <div className="metrics-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
            {[
              { label: 'Accuracy', value: `${metrics.accuracy}%`, highlight: true },
              { label: 'Precision', value: `${(metrics.precision * 100).toFixed(1)}%`, highlight: false },
              { label: 'Recall', value: `${(metrics.recall * 100).toFixed(1)}%`, highlight: false },
              { label: 'F1 Score', value: `${(metrics.f1 * 100).toFixed(1)}%`, highlight: false },
              { label: 'AUC-ROC', value: `${metrics.auc_roc}`, highlight: metrics.auc_roc > 0.9 },
              { label: 'MAPE', value: `${metrics.mape}%`, highlight: false },
              { label: 'RMSE', value: `${metrics.rmse}`, highlight: false },
              { label: 'MAE', value: `${metrics.mae}`, highlight: false },
            ].map((m) => (
              <div key={m.label} className={`metric-card${m.highlight ? ' highlight' : ''}`}>
                <div className="metric-card-label">{m.label}</div>
                <div className="metric-card-value">{m.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="content-section">
              <div className="content-section-header">
                <span className="content-section-title">🔲 Confusion Matrix</span>
              </div>
              <ConfusionMatrix metrics={metrics} />
            </div>

            <div className="content-section">
              <div className="content-section-header">
                <span className="content-section-title">📋 Classification Report</span>
              </div>
              <div className="table-wrapper">
                <table className="stats-table">
                  <thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1</th><th>Support</th></tr></thead>
                  <tbody>
                    {['Class A', 'Class B', 'Class C', 'Macro avg', 'Weighted avg'].map((cls, i) => {
                      const base = i >= 3 ? metrics : { precision: metrics.precision - i * 0.03, recall: metrics.recall - i * 0.025, f1: metrics.f1 - i * 0.028 };
                      return (
                        <tr key={cls} style={{ fontWeight: i >= 3 ? 600 : 400 }}>
                          <td>{cls}</td>
                          <td>{(base.precision * 100).toFixed(1)}%</td>
                          <td>{(base.recall * 100).toFixed(1)}%</td>
                          <td>{(base.f1 * 100).toFixed(1)}%</td>
                          <td style={{ color: 'var(--text-muted)' }}>{i < 3 ? Math.floor(Math.random() * 800 + 200) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="content-section">
            <div className="content-section-header">
              <span className="content-section-title">📊 Benchmarking</span>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarks} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="value" name="Accuracy %">
                    {benchmarks.map((b, i) => (
                      <Cell key={i} fill={b.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--border-radius)', border: '1px solid rgba(16,185,129,0.15)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-success)' }}>
              ✓ Model outperforms baseline by {(metrics.accuracy - Math.max(50, metrics.accuracy - 22)).toFixed(1)} percentage points and industry average by {(metrics.accuracy - Math.max(60, metrics.accuracy - 12)).toFixed(1)} points.
            </div>
          </div>
        </div>
      )}

      {/* ---- ENSEMBLE ---- */}
      {activeSection === 'ensemble' && (
        <div className="content-section">
          <div className="content-section-header">
            <span className="content-section-title">🔗 Ensemble Strategy</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div>
              <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'rgba(139,92,246,0.06)', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  The primary model <strong>{best?.name}</strong> is deployed in production.
                  Ensemble combines {[...selectedModels].map((i) => models[i]?.name).join(' + ')} using
                  weighted averaging — top model carries <strong>70% weight</strong>.
                  All models monitored via PSI/CSI drift detection with automated retraining when PSI &gt; 0.2.
                </p>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Model</th><th>Method</th><th>Weight</th><th>Status</th></tr></thead>
                  <tbody>
                    {[...selectedModels].map((idx, i) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{models[idx]?.name}</td>
                        <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                          {i === 0 ? 'Weighted Vote (Primary)' : i === 1 ? 'Stacking (Secondary)' : 'Bagging (Tertiary)'}
                        </td>
                        <td style={{ fontWeight: 700 }}>{i === 0 ? '70%' : i === 1 ? '20%' : '10%'}</td>
                        <td><span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-success)' }}>✓ Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-hover)', borderRadius: 'var(--border-radius-lg)' }}>
              <div style={{ fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>Ensemble Config</div>
              {[
                { label: 'Method', value: 'Weighted Averaging' },
                { label: 'Top N Models', value: `${selectedModels.size}` },
                { label: 'Primary Weight', value: '70%' },
                { label: 'Drift Threshold (PSI)', value: '0.20' },
                { label: 'Retraining Trigger', value: 'PSI > 0.20' },
                { label: 'Monitoring', value: 'MLflow + Evidently' },
              ].map((r) => (
                <div key={r.label} className="ba-metric-row">
                  <span className="ba-metric-label">{r.label}</span>
                  <span className="ba-metric-value" style={{ fontSize: 'var(--font-size-xs)' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
