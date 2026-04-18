import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { departments } from '../data/departments';
import { departmentProcesses } from '../data/processes';
import ProcessOverviewTab from '../components/process-tabs/ProcessOverviewTab';
import ProcessDataTab from '../components/process-tabs/ProcessDataTab';
import ProcessModelsTab from '../components/process-tabs/ProcessModelsTab';
import ProcessTestingTab from '../components/process-tabs/ProcessTestingTab';
import ProcessGovernanceTab from '../components/process-tabs/ProcessGovernanceTab';
import ProcessDocsTab from '../components/process-tabs/ProcessDocsTab';
import ProcessAutomationTab from '../components/process-tabs/ProcessAutomationTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'data', label: 'Data', icon: '🗂️' },
  { id: 'models', label: 'Models', icon: '🧠' },
  { id: 'testing', label: 'Testing', icon: '🧪' },
  { id: 'governance', label: 'AI Governance', icon: '🏛️' },
  { id: 'docs', label: 'Documentation', icon: '📚' },
  { id: 'automation', label: 'Automation', icon: '⚡' },
];

export default function ProcessPage() {
  const { departmentId, processId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const dept = departments.find((d) => d.id === departmentId);
  if (!dept) return <Navigate to="/" replace />;

  const processes = departmentProcesses[departmentId] || [];
  const process = processes.find((p) => p.id === processId);
  if (!process) return <Navigate to={`/${departmentId}`} replace />;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
            <span>›</span>
            <Link to={`/${departmentId}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{dept.name}</Link>
            <span>›</span>
            <span style={{ color: 'var(--text-secondary)' }}>{process.name}</span>
          </div>
          <div className="page-title">{dept.icon} {process.name}</div>
          <div className="page-subtitle">{process.description}</div>
        </div>
        <div className="page-header-right">
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {process.aiTypes.map((t) => (
              <span key={t} className={`ai-badge ai-badge-${t.toLowerCase().replace(' ', '')}`}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-md)', padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 'var(--border-radius)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
        <span><strong>KPI:</strong> {process.kpi}</span>
        <span><strong>Route:</strong> /{departmentId}/{processId}</span>
      </div>

      <div className="tabs-container">
        <div className="tabs-bar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-item${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-item-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          <div className={`tab-panel${activeTab === 'overview' ? ' active has-padding' : ''}`}>
            <ProcessOverviewTab process={process} dept={dept} />
          </div>
          <div className={`tab-panel${activeTab === 'data' ? ' active has-padding' : ''}`}>
            <ProcessDataTab process={process} dept={dept} />
          </div>
          <div className={`tab-panel${activeTab === 'models' ? ' active has-padding' : ''}`}>
            <ProcessModelsTab process={process} dept={dept} />
          </div>
          <div className={`tab-panel${activeTab === 'testing' ? ' active has-padding' : ''}`}>
            <ProcessTestingTab process={process} dept={dept} />
          </div>
          <div className={`tab-panel${activeTab === 'governance' ? ' active has-padding' : ''}`}>
            <ProcessGovernanceTab process={process} dept={dept} />
          </div>
          <div className={`tab-panel${activeTab === 'docs' ? ' active has-padding' : ''}`}>
            <ProcessDocsTab process={process} dept={dept} />
          </div>
          <div className={`tab-panel${activeTab === 'automation' ? ' active has-padding' : ''}`}>
            <ProcessAutomationTab process={process} dept={dept} />
          </div>
        </div>
      </div>
    </div>
  );
}
