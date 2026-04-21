// DataFlowsSection.jsx — stub (filled in commit 5).
import SectionCard from './SectionCard';

export default function DataFlowsSection({ dept }) {
  return (
    <SectionCard id="dataflows" icon="🔀" title="Data flows" subtitle={dept.name}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
