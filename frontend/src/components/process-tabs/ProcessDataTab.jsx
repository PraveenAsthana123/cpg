import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function generateSampleData(process) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((m) => ({
    month: m,
    before: Math.floor(Math.random() * 400 + 400),
    after: Math.floor(Math.random() * 200 + 550),
  }));
}

const BEFORE_ROWS = [
  { field: 'Data Source', value: 'Manual spreadsheets / ERP export' },
  { field: 'Update Frequency', value: 'Weekly batch, 3-day lag' },
  { field: 'Format', value: 'Excel (.xlsx), no schema validation' },
  { field: 'Data Quality', value: 'Missing values ~15%, duplicates ~5%' },
  { field: 'Accessibility', value: 'Email distribution, no versioning' },
];

const AFTER_ROWS = [
  { field: 'Data Source', value: 'Automated pipeline from ERP + API' },
  { field: 'Update Frequency', value: 'Real-time / daily refresh' },
  { field: 'Format', value: 'Parquet + Delta Lake, schema enforced' },
  { field: 'Data Quality', value: 'Automated validation, <0.5% issues' },
  { field: 'Accessibility', value: 'API + dashboard, versioned datasets' },
];

export default function ProcessDataTab({ process }) {
  const chartData = generateSampleData(process);

  return (
    <div>
      <div className="before-after-grid">
        <div className="before-after-card before-card">
          <div className="before-after-header">⚠️ Data State: Before</div>
          <div className="before-after-body">
            {BEFORE_ROWS.map((r, i) => (
              <div key={i} className="ba-metric-row">
                <span className="ba-metric-label">{r.field}</span>
                <span className="ba-metric-value" style={{ fontSize: 'var(--font-size-xs)', maxWidth: 200, textAlign: 'right' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="before-after-card after-card">
          <div className="before-after-header">✅ Data State: After</div>
          <div className="before-after-body">
            {AFTER_ROWS.map((r, i) => (
              <div key={i} className="ba-metric-row">
                <span className="ba-metric-label">{r.field}</span>
                <span className="ba-metric-value" style={{ fontSize: 'var(--font-size-xs)', maxWidth: 200, textAlign: 'right' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📊 Performance Trend (Before vs After AI)</span>
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="before" name="Before AI" fill="var(--accent-danger)" opacity={0.7} radius={[3, 3, 0, 0]} />
              <Bar dataKey="after" name="After AI" fill="var(--accent-success)" opacity={0.8} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📋 Process Inputs</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Input Data</th><th>Source</th><th>Frequency</th></tr>
            </thead>
            <tbody>
              {process.inputs.split(',').map((inp, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{inp.trim()}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>ERP / Data Lake</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Daily</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📤 Process Outputs</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Output</th><th>Format</th><th>Consumer</th></tr>
            </thead>
            <tbody>
              {process.outputs.split(',').map((out, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{out.trim()}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Dashboard / API / ERP</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Operations / Management</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
