// roles.js — Four canonical roles, with per-department responsibilities.
// Phase 1 seeds 3 depts fully (sales, marketing, contact-center).
// Remaining 11 depts use empty objects; UI renders fallback.

export const ROLE_IDS = ['manager', 'team-member', 'compliance', 'reporting-monitoring'];

export const ROLE_LABELS = {
  manager: 'Manager',
  'team-member': 'Team Member',
  compliance: 'Compliance',
  'reporting-monitoring': 'Reporting & Monitoring',
};

export const ROLE_ICONS = {
  manager: '👔',
  'team-member': '🧑‍💻',
  compliance: '🛡️',
  'reporting-monitoring': '📡',
};

// reports array uses IDs from reports.js
export const rolesByDept = {
  sales: {
    manager: {
      title: 'Sales Manager',
      responsibilities: [
        'Set quarterly revenue targets and territory plans',
        'Approve forecast models and pricing strategy changes',
        'Review pipeline health and team scorecards weekly',
        'Own SLA and ROI outcomes for the Sales function',
      ],
      kpis: ['Revenue $', 'Forecast accuracy %', 'Deal cycle days', 'Win rate %'],
      reports: ['exec-kpi', 'mbr', 'team-scorecard', 'roi-tracker', 'pipeline-health'],
    },
    'team-member': {
      title: 'Sales Analyst',
      responsibilities: [
        'Maintain CRM hygiene and opportunity stages',
        'Run daily pipeline reports and flag at-risk deals',
        'Execute lead-scoring tasks assigned by Manager',
      ],
      kpis: ['Tasks completed', 'Data quality %', 'Forecasts submitted on time'],
      reports: ['my-tasks', 'daily-productivity', 'personal-scorecard'],
    },
    compliance: {
      title: 'Sales Compliance Officer',
      responsibilities: [
        'Audit discount approvals and deal-desk exceptions',
        'Track PII access in CRM',
        'Validate model fairness for lead scoring',
      ],
      kpis: ['Violation rate', 'Audit findings closed', 'PII access alerts'],
      reports: ['audit-trail', 'policy-violations', 'model-fairness', 'pii-access'],
    },
    'reporting-monitoring': {
      title: 'Sales Ops Monitor',
      responsibilities: [
        'Watch forecasting model drift and data pipeline health',
        'Respond to anomaly alerts in sales telemetry',
        'Maintain scheduled job calendar for daily/weekly reports',
      ],
      kpis: ['System uptime %', 'Drift incidents', 'Jobs failed/recovered'],
      reports: ['system-health', 'model-drift', 'pipeline-status', 'anomaly-detection', 'scheduled-jobs'],
    },
  },
  marketing: {
    manager: {
      title: 'Marketing Manager',
      responsibilities: [
        'Own campaign calendar and channel budget allocation',
        'Approve generative creative and landing-page variants',
        'Review attribution and funnel conversion weekly',
      ],
      kpis: ['Campaign ROI %', 'CAC', 'Conversion rate %', 'Funnel drop-off %'],
      reports: ['exec-kpi', 'mbr', 'roi-tracker', 'pipeline-health'],
    },
    'team-member': {
      title: 'Marketing Specialist',
      responsibilities: [
        'Execute AI-assisted content generation (ads, emails, SEO)',
        'A/B test variants and report winners',
        'Maintain audience segments and CRM journeys',
      ],
      kpis: ['Content shipped', 'Variants tested', 'Engagement rate'],
      reports: ['my-tasks', 'daily-productivity', 'personal-scorecard'],
    },
    compliance: {
      title: 'Marketing Compliance Officer',
      responsibilities: [
        'Ensure generative content meets brand and legal standards',
        'Audit consent records (CAN-SPAM, GDPR, CCPA)',
        'Validate model fairness for audience targeting',
      ],
      kpis: ['Consent violations', 'Brand compliance %', 'Audit findings closed'],
      reports: ['audit-trail', 'regulatory-checklist', 'policy-violations', 'model-fairness', 'pii-access'],
    },
    'reporting-monitoring': {
      title: 'Marketing Analytics Ops',
      responsibilities: [
        'Monitor attribution model drift and feed freshness',
        'Watch funnel anomalies and alert creative team',
        'Operate scheduled campaign performance reports',
      ],
      kpis: ['Data freshness', 'Anomalies flagged', 'Scheduled job success %'],
      reports: ['system-health', 'model-drift', 'pipeline-status', 'anomaly-detection', 'scheduled-jobs'],
    },
  },
  'contact-center': {
    manager: {
      title: 'Contact Center Manager',
      responsibilities: [
        'Plan workforce schedules and SLA targets',
        'Review AI agent handoff quality and CSAT trends',
        'Approve voice-AI prompt changes and model versions',
      ],
      kpis: ['AHT', 'CSAT', 'First-contact resolution %', 'Agent utilization %'],
      reports: ['exec-kpi', 'mbr', 'team-scorecard', 'sla-summary', 'roi-tracker'],
    },
    'team-member': {
      title: 'Customer Service Agent',
      responsibilities: [
        'Handle customer contacts with AI whisper coaching',
        'Escalate complex cases per playbook',
        'Log call dispositions and feedback',
      ],
      kpis: ['Calls handled', 'CSAT per agent', 'Adherence %'],
      reports: ['my-tasks', 'daily-productivity', 'personal-scorecard', 'assigned-incidents'],
    },
    compliance: {
      title: 'Contact Center Compliance Officer',
      responsibilities: [
        'Audit call recordings for PII handling and script adherence',
        'Review AI agent responses for regulatory compliance',
        'Track complaint resolution SLAs',
      ],
      kpis: ['PII incidents', 'Script compliance %', 'Regulatory findings'],
      reports: ['audit-trail', 'regulatory-checklist', 'policy-violations', 'model-fairness', 'pii-access', 'change-mgmt'],
    },
    'reporting-monitoring': {
      title: 'Contact Center Ops Monitor',
      responsibilities: [
        'Watch queue health, IVR drop-off, voice-AI latency',
        'Alert on anomalies (surge, outage, drift)',
        'Operate shift-level ops dashboards',
      ],
      kpis: ['Queue wait', 'Voice-AI latency', 'Uptime %'],
      reports: ['system-health', 'model-drift', 'pipeline-status', 'anomaly-detection', 'scheduled-jobs', 'api-latency'],
    },
  },
  // Remaining 11 depts use empty objects; UI renders "Data not yet populated" fallback.
  'supply-chain': {},
  logistics: {},
  manufacturing: {},
  maintenance: {},
  retail: {},
  customer: {},
  telehealth: {},
  'demand-forecasting': {},
  finance: {},
  quality: {},
  hr: {},
};

export function getRolesForDept(deptId) {
  return rolesByDept[deptId] || {};
}
