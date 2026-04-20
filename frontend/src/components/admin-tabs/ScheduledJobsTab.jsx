import TabStub from '../common/TabStub';
export default function ScheduledJobsTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Scheduled Jobs`}
    description="Cron-scheduled AI/RPA jobs: schedule, last run, next run, status, owner."
  />;
}
