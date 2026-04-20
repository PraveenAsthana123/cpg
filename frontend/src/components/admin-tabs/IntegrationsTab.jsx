import TabStub from '../common/TabStub';
export default function IntegrationsTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — Integrations & Data Sources`}
    description="REST/GraphQL APIs, databases, Kaggle, SaaS connectors (Salesforce/SAP/Shopify), ETL schedules, field mappings, sync health."
  />;
}
