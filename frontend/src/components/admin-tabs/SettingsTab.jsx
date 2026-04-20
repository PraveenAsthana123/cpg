import TabStub from '../common/TabStub';
export default function SettingsTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Settings`}
    description="Department branding, SLA thresholds, alert rules, notification channels."
  />;
}
