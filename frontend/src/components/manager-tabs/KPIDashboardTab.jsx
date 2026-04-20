import TabStub from '../common/TabStub';
export default function KPIDashboardTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — KPI Dashboard`}
    description="Executive KPIs with AI decision-support recommendations for the department."
  />;
}
