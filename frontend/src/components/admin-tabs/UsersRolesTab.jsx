import TabStub from '../common/TabStub';
export default function UsersRolesTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Users & Roles`}
    description="Assign Manager / Team Member / Compliance / Reporting roles. Manage access and team composition."
  />;
}
