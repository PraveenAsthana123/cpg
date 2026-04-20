import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { seededRng, randInt, randFloat, pick } from '../../../utils/seed';

const SEGMENTS = ['Champion', 'Loyal', 'New', 'At Risk', 'Dormant'];

function genCustomers(deptId) {
  const rng = seededRng(`churn-${deptId}`);
  const rows = [];
  for (let i = 0; i < 20; i += 1) {
    const segment = pick(rng, SEGMENTS);
    const tenureMonths = randInt(rng, 1, 96);
    const activity = randFloat(rng, 0.1, 1.0, 2);
    // Higher churn for At Risk / Dormant, lower for Champion.
    let baseChurn;
    if (segment === 'Champion') baseChurn = randFloat(rng, 2, 12, 1);
    else if (segment === 'Loyal') baseChurn = randFloat(rng, 5, 22, 1);
    else if (segment === 'New') baseChurn = randFloat(rng, 15, 38, 1);
    else if (segment === 'At Risk') baseChurn = randFloat(rng, 55, 88, 1);
    else baseChurn = randFloat(rng, 70, 96, 1);
    rows.push({
      id: `C-${1000 + i}`,
      segment,
      tenureMonths,
      activity,
      churn: baseChurn,
    });
  }
  return rows.sort((a, b) => b.churn - a.churn);
}

function genTrend(deptId) {
  const rng = seededRng(`churn-trend-${deptId}`);
  const weeks = 12;
  return Array.from({ length: weeks }, (_, i) => ({
    week: `W${i + 1}`,
    Champion: randFloat(rng, 2, 6, 1),
    Loyal: randFloat(rng, 6, 14, 1),
    AtRisk: randFloat(rng, 55, 78, 1),
  }));
}

export default function ChurnRiskTab({ dept }) {
  const deptId = dept?.id || 'customer';
  const customers = useMemo(() => genCustomers(deptId), [deptId]);
  const trend = useMemo(() => genTrend(deptId), [deptId]);

  const highRisk = customers.filter((c) => c.churn >= 50).length;

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
        Top-20 at-risk customers for <strong style={{ color: '#0f172a' }}>{dept?.name || 'Customer'}</strong>.
        Probabilities from a deterministic demo model (not a live inference).
      </div>

      {/* Summary tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12, marginBottom: 16,
      }}>
        <SummaryTile label="Cohort size" value={customers.length} />
        <SummaryTile label="High risk (≥ 50%)" value={highRisk} color="#dc2626" />
        <SummaryTile
          label="Avg tenure"
          value={`${Math.round(customers.reduce((s, c) => s + c.tenureMonths, 0) / customers.length)} mo`}
        />
        <SummaryTile
          label="Avg activity"
          value={(customers.reduce((s, c) => s + c.activity, 0) / customers.length).toFixed(2)}
        />
      </div>

      {/* Trend chart */}
      <div style={{
        border: '1px solid #e2e8f0', borderRadius: 8,
        padding: 12, background: '#fff', marginBottom: 16,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 8 }}>
          Segment churn rate trend (last 12 weeks)
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Champion" stroke="#059669" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Loyal" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="AtRisk" stroke="#dc2626" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer list */}
      <div style={{
        border: '1px solid #e2e8f0', borderRadius: 8,
        overflow: 'hidden', background: '#fff',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: 10, textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Segment</th>
              <th style={{ padding: 10, textAlign: 'right', color: '#64748b', fontWeight: 600 }}>Tenure (mo)</th>
              <th style={{ padding: 10, textAlign: 'right', color: '#64748b', fontWeight: 600 }}>Activity</th>
              <th style={{ padding: 10, textAlign: 'left', color: '#64748b', fontWeight: 600, minWidth: 180 }}>Churn probability</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const severityColor = c.churn >= 75 ? '#dc2626'
                : c.churn >= 50 ? '#ea580c'
                : c.churn >= 25 ? '#b45309'
                : '#059669';
              return (
                <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 10, fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 600, color: '#0f172a' }}>
                    {c.id}
                  </td>
                  <td style={{ padding: 10, color: '#0f172a' }}>{c.segment}</td>
                  <td style={{ padding: 10, textAlign: 'right', color: '#64748b' }}>{c.tenureMonths}</td>
                  <td style={{ padding: 10, textAlign: 'right', color: '#64748b' }}>{c.activity}</td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        flex: 1, height: 10, background: '#f1f5f9',
                        borderRadius: 5, overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${c.churn}%`, height: '100%',
                          background: severityColor,
                        }} />
                      </div>
                      <span style={{
                        fontSize: 12, width: 48, textAlign: 'right',
                        color: severityColor, fontWeight: 700,
                      }}>
                        {c.churn}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, color = '#0f172a' }) {
  return (
    <div style={{
      border: '1px solid #e2e8f0', borderRadius: 8,
      padding: 14, background: '#fff',
    }}>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}
