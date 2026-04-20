import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { departments } from '../data/departments';
import KPIDashboardTab from '../components/manager-tabs/KPIDashboardTab';
import StatusHealthTab from '../components/manager-tabs/StatusHealthTab';
import ReportsTab from '../components/manager-tabs/ReportsTab';
import MonitoringAlertsTab from '../components/manager-tabs/MonitoringAlertsTab';
import TeamPerformanceTab from '../components/manager-tabs/TeamPerformanceTab';
import DataFlowTab from '../components/manager-tabs/DataFlowTab';
import RolesResponsibilitiesTab from '../components/manager-tabs/RolesResponsibilitiesTab';
import SalesForecastTab from '../components/manager-tabs/sales/ForecastTab';
import SalesRevenueDrillDownTab from '../components/manager-tabs/sales/RevenueDrillDownTab';
import SalesSimulationTab from '../components/manager-tabs/sales/SimulationTab';

const BASE_TABS = [
  { id: 'kpi-dashboard',          label: 'KPI Dashboard',            icon: '📊', Component: KPIDashboardTab          },
  { id: 'status-health',          label: 'Status & Health',          icon: '🫀', Component: StatusHealthTab          },
  { id: 'reports',                label: 'Reports',                  icon: '📑', Component: ReportsTab               },
  { id: 'monitoring-alerts',      label: 'Monitoring & Alerts',      icon: '🚨', Component: MonitoringAlertsTab      },
  { id: 'team-performance',       label: 'Team Performance',         icon: '🏆', Component: TeamPerformanceTab       },
  { id: 'data-flow',              label: 'Cross-Dept Data Flow',     icon: '🔀', Component: DataFlowTab              },
  { id: 'roles-responsibilities', label: 'Roles & Responsibilities', icon: '🧩', Component: RolesResponsibilitiesTab },
];

const SALES_EXTRA_TABS = [
  { id: 'sales-forecast',       label: 'Forecast',        icon: '📈', Component: SalesForecastTab          },
  { id: 'sales-revenue',        label: 'Revenue Tree',    icon: '🌲', Component: SalesRevenueDrillDownTab },
  { id: 'sales-simulation',     label: 'Simulation',      icon: '🎯', Component: SalesSimulationTab        },
];

function tabsForDept(deptId) {
  if (deptId === 'sales') return [...BASE_TABS, ...SALES_EXTRA_TABS];
  return BASE_TABS;
}

export default function ManagerPage() {
  const { departmentId } = useParams();
  const [activeTab, setActiveTab] = useState('kpi-dashboard');
  const dept = departments.find((d) => d.id === departmentId);
  if (!dept || dept.id === 'dashboard') return <Navigate to="/" replace />;

  const TABS = tabsForDept(dept.id);
  const Active = TABS.find((t) => t.id === activeTab).Component;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">📊 {dept.name} — Manager</div>
          <div className="page-subtitle">KPIs, reports, monitoring, team performance for the {dept.name} department</div>
        </div>
        <div className="page-header-right">
          <span style={{
            padding: '6px 16px', borderRadius: 'var(--border-radius-lg)',
            background: `${dept.color}15`, border: `1px solid ${dept.color}33`,
            color: dept.color, fontSize: 'var(--font-size-sm)', fontWeight: 600,
          }}>
            {dept.icon} {dept.name}
          </span>
        </div>
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
          <div className="tab-panel active has-padding">
            <Active dept={dept} />
          </div>
        </div>
      </div>
    </div>
  );
}
