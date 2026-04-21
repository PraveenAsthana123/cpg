// DocumentsSection.jsx — stub (filled in commit 4).
import SectionCard from './SectionCard';

export default function DocumentsSection({ dept }) {
  return (
    <SectionCard id="documents" icon="📚" title="Documents / RAG corpus" subtitle={dept.name}>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>Pending fill.</div>
    </SectionCard>
  );
}
