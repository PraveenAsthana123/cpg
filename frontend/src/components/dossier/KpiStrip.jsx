// KpiStrip.jsx — stub (filled in commit 3).
import SectionCard from './SectionCard';

export default function KpiStrip({ dept }) {
  return (
    <SectionCard id="kpis" icon="📊" title="KPIs" subtitle={`${dept.name}`}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
