// BackendStatusRow.jsx — stub (filled in commit 3).
import SectionCard from './SectionCard';

export default function BackendStatusRow({ dept }) {
  return (
    <SectionCard id="status" icon="🟢" title="Backend status" subtitle={dept.name}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
