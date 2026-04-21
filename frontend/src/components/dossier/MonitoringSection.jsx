// MonitoringSection.jsx — stub (filled in commit 5).
import SectionCard from './SectionCard';

export default function MonitoringSection({ dept }) {
  return (
    <SectionCard id="monitoring" icon="📡" title="Monitoring snapshot" subtitle={dept.name}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
