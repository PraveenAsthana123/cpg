// RolesSection.jsx — stub (filled in commit 4).
import SectionCard from './SectionCard';

export default function RolesSection({ dept }) {
  return (
    <SectionCard id="roles" icon="👥" title="Roles & Responsibilities" subtitle={dept.name}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
