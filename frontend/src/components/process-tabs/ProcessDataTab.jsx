import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function generateSampleData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((m) => ({
    month: m,
    before: Math.floor(Math.random() * 400 + 400),
    after: Math.floor(Math.random() * 200 + 550),
  }));
}

const DATA_INFO = {
  'demand-forecasting': { size: '2.4 GB', rows: '3,000,000', columns: 33, format: 'CSV / Parquet', path: 'data/kaggle/sales/train.csv' },
  'price-elasticity': { size: '850 MB', rows: '1,200,000', columns: 18, format: 'CSV', path: 'data/kaggle/sales/transactions.csv' },
  'promo-uplift': { size: '1.1 GB', rows: '1,800,000', columns: 22, format: 'CSV', path: 'data/kaggle/sales/train.csv' },
  'inventory-optimization': { size: '560 MB', rows: '800,000', columns: 15, format: 'CSV', path: 'data/kaggle/supply_chain/inventory.csv' },
  'safety-stock': { size: '340 MB', rows: '500,000', columns: 12, format: 'CSV', path: 'data/kaggle/supply_chain/stock_levels.csv' },
  'route-optimization': { size: '720 MB', rows: '950,000', columns: 20, format: 'CSV', path: 'data/kaggle/logistics/shipments.csv' },
  'production-planning': { size: '1.5 GB', rows: '2,100,000', columns: 28, format: 'CSV / Parquet', path: 'data/kaggle/manufacturing/sensor_data.csv' },
  'predictive-maintenance': { size: '980 MB', rows: '1,400,000', columns: 25, format: 'CSV', path: 'data/kaggle/maintenance/equipment.csv' },
  'shelf-optimization': { size: '450 MB', rows: '650,000', columns: 16, format: 'CSV', path: 'data/kaggle/retail/transactions.csv' },
  'customer-segmentation': { size: '120 MB', rows: '200,000', columns: 11, format: 'CSV', path: 'data/kaggle/customer/customers.csv' },
  'revenue-forecasting': { size: '380 MB', rows: '550,000', columns: 14, format: 'CSV', path: 'data/kaggle/finance/financial_data.csv' },
  'supplier-scoring': { size: '210 MB', rows: '300,000', columns: 13, format: 'CSV', path: 'data/kaggle/procurement/suppliers.csv' },
  'defect-detection': { size: '3.2 GB', rows: '12,000 images', columns: 'N/A', format: 'JPG / PNG', path: 'data/kaggle/quality/casting_images/' },
  'compliance-monitoring': { size: '180 MB', rows: '250,000', columns: 18, format: 'CSV / JSON', path: 'data/kaggle/governance/food_enforcement.csv' },
};

const DEFAULT_DATA = { size: '500 MB', rows: '750,000', columns: 15, format: 'CSV', path: 'data/kaggle/default/data.csv' };

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

export default function ProcessDataTab({ process, dept }) {
  const chartData = generateSampleData();
  const dataInfo = DATA_INFO[process.id] || DEFAULT_DATA;
  const [customPath, setCustomPath] = useState('');
  const [activePath, setActivePath] = useState(dataInfo.path);

  const handleSetPath = () => {
    if (customPath.trim()) {
      setActivePath(customPath.trim());
    }
  };

  return (
    <div>
      {/* Data Source Info Panel */}
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">🗂️ Data Source Information</span>
        </div>
        <div className="kpi-row">
          <div className="kpi-mini">
            <div className="kpi-mini-label">Data Size</div>
            <div className="kpi-mini-value">{dataInfo.size}</div>
          </div>
          <div className="kpi-mini">
            <div className="kpi-mini-label">Total Rows</div>
            <div className="kpi-mini-value">{dataInfo.rows}</div>
          </div>
          <div className="kpi-mini">
            <div className="kpi-mini-label">Columns</div>
            <div className="kpi-mini-value">{dataInfo.columns}</div>
          </div>
          <div className="kpi-mini">
            <div className="kpi-mini-label">Format</div>
            <div className="kpi-mini-value">{dataInfo.format}</div>
          </div>
        </div>

        <div className="table-wrapper" style={{ marginTop: 'var(--spacing-md)' }}>
          <table className="data-table">
            <thead>
              <tr><th>Property</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 500 }}>Data Type</td>
                <td>{dataInfo.format.includes('JPG') ? 'Image' : dataInfo.format.includes('JSON') ? 'Text / Structured' : 'Structured (Tabular)'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Active Data Path</td>
                <td>
                  <code style={{ background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 4, fontSize: 'var(--font-size-xs)' }}>
                    {activePath}
                  </code>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Default Kaggle Path</td>
                <td>
                  <code style={{ background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 4, fontSize: 'var(--font-size-xs)' }}>
                    {dataInfo.path}
                  </code>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Department</td>
                <td>{dept?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Data Size</td>
                <td>{dataInfo.size}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Row Count</td>
                <td>{dataInfo.rows}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Data Path Input */}
      <div className="content-section">
        <div className="content-section-header">
          <span className="content-section-title">📂 Use Your Own Data</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter path to your data file (e.g., /home/user/my_sales_data.csv)"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleSetPath}>
            Set Path
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { setCustomPath(''); setActivePath(dataInfo.path); }}
          >
            Reset
          </button>
        </div>
        {activePath !== dataInfo.path && (
          <div style={{ marginTop: 'var(--spacing-sm)', padding: '8px 12px', background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-primary)' }}>
            Using custom data path: <strong>{activePath}</strong>
          </div>
        )}
      </div>

      {/* Before / After Comparison */}
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

      {/* Performance Chart */}
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

      {/* Process Inputs */}
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

      {/* Process Outputs */}
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
