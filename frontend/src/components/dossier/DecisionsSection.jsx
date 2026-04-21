// DecisionsSection.jsx — stub (filled in commit 5).
import SectionCard from './SectionCard';

export default function DecisionsSection({ dept }) {
  return (
    <SectionCard id="decisions" icon="🎯" title="Recent decisions" subtitle={dept.name}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
