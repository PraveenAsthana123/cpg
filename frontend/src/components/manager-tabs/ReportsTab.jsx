import TabStub from '../common/TabStub';
export default function ReportsTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Reports`}
    description="23 report types filtered by role: Manager (7), Team Member (4), Compliance (6), Reporting & Monitoring (6)."
  />;
}
