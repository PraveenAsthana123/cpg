import TabStub from '../common/TabStub';
export default function TeamPerformanceTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Team Performance`}
    description="Queue depth, productivity, scorecards, workload distribution."
  />;
}
