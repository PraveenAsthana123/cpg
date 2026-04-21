// LifecyclesSection.jsx — stub (filled in commit 5).
import SectionCard from './SectionCard';

export default function LifecyclesSection({ dept }) {
  return (
    <SectionCard id="lifecycles" icon="🔄" title="Lifecycles" subtitle={dept.name}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
