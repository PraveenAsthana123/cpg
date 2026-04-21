// ReportsSection.jsx — stub (filled in commit 4).
import SectionCard from './SectionCard';

export default function ReportsSection({ dept }) {
  return (
    <SectionCard id="reports" icon="📑" title="Reports" subtitle={dept.name}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
