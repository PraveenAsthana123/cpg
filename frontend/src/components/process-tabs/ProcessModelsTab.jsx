import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function ProcessModelsTab({ process }) {
  const models = process.models || [];
  const best = models[0];

  const radarData = best ? [
    { metric: 'Accuracy', value: best.accuracy },
    { metric: 'Speed', value: 85 },
    { metric: 'Interpretability', value: 70 },
    { metric: 'Scalability', value: 90 },
    { metric: 'Stability', value: 88 },
  ] : [];

  return (
    <div>
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🧠 Model Comparison</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{models.length} models evaluated</span>
        </div>
        <table className="model-comparison">
          <thead>
            <tr>
              <th>Model</th>
              <th>Algorithm</th>
              <th>Use Case</th>
              <th>Accuracy</th>
              <th>Selection</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => (
              <tr key={i} className={i === 0 ? 'best-model' : ''}>
                <td>
                  <div className="model-name-cell">
                    {i === 0 && <span className="best-model-crown">👑</span>}
                    {m.name}
                  </div>
                </td>
                <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{m.algorithm}</td>
                <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{m.useCase}</td>
                <td>
                  <div className="accuracy-bar">
                    <div className="accuracy-fill" style={{ width: `${Math.min(m.accuracy, 100)}px`, maxWidth: 80, background: i === 0 ? 'var(--accent-success)' : 'var(--accent-primary)' }} />
                    <span className="accuracy-value">{m.accuracy}%</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: i === 0 ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                    {i === 0 ? '✓ Selected' : 'Evaluated'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                <div key={i} className="test-case-card">
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

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🔗 Ensemble Strategy</span>
        </div>
        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(139,92,246,0.06)', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The primary model <strong>{best?.name}</strong> is deployed in production.
            Ensemble approach combines top {Math.min(models.length, 2)} models using weighted averaging
            where the best model carries 70% weight. All models are monitored via PSI/CSI drift detection
            with automated retraining triggered when PSI &gt; 0.2.
          </p>
        </div>
      </div>
    </div>
  );
}
