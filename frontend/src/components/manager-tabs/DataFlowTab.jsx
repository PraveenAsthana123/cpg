import TabStub from '../common/TabStub';
export default function DataFlowTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Cross-Dept Data Flow`}
    description="Upstream and downstream data dependencies for this department (per-dept view). Global view available at /data-flow."
  />;
}
