import TabStub from '../common/TabStub';
export default function ModelRegistryTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Model Registry`}
    description="Deploy, rollback, deprecate ML/LLM models. Track versions, lineage, evaluation."
  />;
}
