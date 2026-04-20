import TabStub from '../common/TabStub';
export default function PermissionsTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Permissions Matrix`}
    description="Role × resource permission grid for the department."
  />;
}
