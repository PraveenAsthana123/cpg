import TabStub from '../common/TabStub';
export default function WorkflowsTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Workflows`}
    description="Workflow automations across 6 domains: Customer, Process, Employee, Admin, Testing, Security. Each workflow: trigger, steps, AI actions, owner, status."
  />;
}
