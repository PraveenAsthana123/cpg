import TabStub from '../common/TabStub';
export default function RolesResponsibilitiesTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Roles & Responsibilities`}
    description="4 roles: Manager, Team Member, Compliance, Reporting & Monitoring. Each with responsibilities, KPIs, and owned reports."
  />;
}
