import TabStub from '../common/TabStub';
export default function StatusHealthTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Status & Health`}
    description="SLA compliance, model drift, data pipeline health, scheduled job success rates."
  />;
}
