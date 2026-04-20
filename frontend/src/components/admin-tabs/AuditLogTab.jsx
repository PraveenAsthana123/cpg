import TabStub from '../common/TabStub';
export default function AuditLogTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Audit Log`}
    description="Admin/compliance events: role changes, model deployments, policy edits. Filter by user, action, date."
  />;
}
