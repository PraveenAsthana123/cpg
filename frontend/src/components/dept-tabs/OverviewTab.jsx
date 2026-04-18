import { departmentROI } from '../../data/roi';
import { departmentAIStack } from '../../data/aiStack';

export default function OverviewTab({ dept }) {
  const roi = departmentROI[dept.id] || [];
  const aiStack = departmentAIStack[dept.id] || [];

  return (
    <div>
      <div className="content-section">
        <h3 className="content-section-title">Department Overview</h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {dept.description}
        </p>
        <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
          {dept.aiTypes.map((t) => (
            <span key={t} className={`ai-badge ai-badge-${t.toLowerCase().replace(' ', '')}`}>{t}</span>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-accent blue" />
          <div className="kpi-label">Processes</div>
          <div className="kpi-value">{dept.processCount}</div>
          <div className="kpi-change neutral"><span className="kpi-change-label">AI-powered workflows</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent green" />
          <div className="kpi-label">ROI Impact</div>
          <div className="kpi-value" style={{ fontSize: 'var(--font-size-xl)' }}>{dept.roi}</div>
          <div className="kpi-change positive"><span className="kpi-change-arrow">↑</span> Measured impact</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent purple" />
          <div className="kpi-label">AI Stack</div>
          <div className="kpi-value">{dept.aiTypes.length}</div>
          <div className="kpi-change neutral"><span className="kpi-change-label">AI types deployed</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-accent amber" />
          <div className="kpi-label">Dataset</div>
          <div className="kpi-value" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Kaggle</div>
          <div className="kpi-change neutral"><span className="kpi-change-label">{dept.kaggleDataset}</span></div>
        </div>
      </div>

      {roi.length > 0 && (
        <div className="content-section">
          <div className="content-section-header">
            <span className="content-section-title">💰 Key ROI Highlights</span>
          </div>
          <div className="card-grid card-grid-2">
            {roi.slice(0, 4).map((r, i) => (
              <div key={i} className="card">
                <div className="card-body">
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>{r.area}</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--accent-success)', marginBottom: 6 }}>{r.impact}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{r.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiStack.length > 0 && (
        <div className="content-section">
          <div className="content-section-header">
            <span className="content-section-title">🤖 AI Stack Summary</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>AI Type</th>
                  <th>Use Case</th>
                  <th>Example Output</th>
                </tr>
              </thead>
              <tbody>
                {aiStack.map((ai, i) => (
                  <tr key={i}>
                    <td><span className={`ai-badge ai-badge-${ai.type.toLowerCase().replace(' ', '')}`}>{ai.type}</span></td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{ai.useCase}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)', fontStyle: 'italic', color: 'var(--text-muted)' }}>{ai.exampleOutput}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
