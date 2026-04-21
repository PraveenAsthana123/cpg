// ProcessesSection.jsx — stub (filled in commit 3).
import SectionCard from './SectionCard';

export default function ProcessesSection({ dept }) {
  return (
    <SectionCard id="processes" icon="⚙️" title="Processes" subtitle={dept.name}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
