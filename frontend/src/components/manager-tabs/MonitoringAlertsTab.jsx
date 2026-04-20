import TabStub from '../common/TabStub';
export default function MonitoringAlertsTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Monitoring & Alerts`}
    description="Real-time anomaly feed, active alerts, incident timeline, routing rules."
  />;
}
