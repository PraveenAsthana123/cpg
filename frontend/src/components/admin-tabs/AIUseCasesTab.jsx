import TabStub from '../common/TabStub';
export default function AIUseCasesTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — AI Use Cases & Automations`}
    description="16 categories: RPA, n8n, Voice AI, CRM, Campaign, Email Mkt, Digital Mkt, Vendor Mgmt, Contact Center Mgmt, Recommendation, Anomaly Detection, Fraud Detection, AI Agent, Generative Marketing, SEO Content, Funnel Optimization."
  />;
}
