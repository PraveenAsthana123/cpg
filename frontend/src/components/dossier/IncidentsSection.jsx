// IncidentsSection.jsx — stub (filled in commit 5).
import SectionCard from './SectionCard';

export default function IncidentsSection({ dept }) {
  return (
    <SectionCard id="incidents" icon="🚨" title="Incidents / RBAC events" subtitle={dept.name}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
