import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { departments } from '../data/departments';
import { departmentProcesses } from '../data/processes';
import '../styles/sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (deptId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  // Auto-expand if current path matches a department
  const currentDeptId = location.pathname.split('/')[1] || '';

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-header">
        <div className="sidebar-logo">CPG</div>
        <div>
          <div className="sidebar-title">CPG Analytics</div>
          <div style={{ fontSize: '10px', color: 'rgba(226,232,240,0.45)', marginTop: '1px' }}>AI Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {departments.map((dept) => {
          const processes = dept.id !== 'dashboard' ? (departmentProcesses[dept.id] || []) : [];
          const hasProcesses = processes.length > 0;
          const isExpanded = expanded[dept.id] || currentDeptId === dept.id;
          const isDeptActive = location.pathname === dept.route || location.pathname.startsWith(`/${dept.id}/`);

          if (dept.id === 'dashboard') {
            return (
              <NavLink
                key={dept.id}
                to={dept.route}
                end
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span className="nav-item-icon">{dept.icon}</span>
                <span className="nav-item-label">{dept.name}</span>
              </NavLink>
            );
          }

          return (
            <div key={dept.id} className="nav-group">
              <div
                className={'nav-item nav-item-parent' + (isDeptActive ? ' active' : '')}
                onClick={(e) => toggleExpand(dept.id, e)}
              >
                <span className="nav-item-icon">{dept.icon}</span>
                <NavLink
                  to={dept.route}
                  className="nav-item-label"
                  onClick={(e) => e.stopPropagation()}
                >
                  {dept.name}
                </NavLink>
                <span className={'nav-expand-arrow' + (isExpanded ? ' expanded' : '')}>
                  &#9662;
                </span>
              </div>

              {isExpanded && (
                <div className="nav-subitems">
                  <NavLink
                    to={`/${dept.id}/admin`}
                    className={({ isActive }) => 'nav-subitem nav-subitem-admin' + (isActive ? ' active' : '')}
                  >
                    <span className="nav-subitem-icon">⚙️</span>
                    <span className="nav-subitem-label">Admin</span>
                  </NavLink>
                  <NavLink
                    to={`/${dept.id}/manager`}
                    className={({ isActive }) => 'nav-subitem nav-subitem-manager' + (isActive ? ' active' : '')}
                  >
                    <span className="nav-subitem-icon">📊</span>
                    <span className="nav-subitem-label">Manager</span>
                  </NavLink>
                  <NavLink
                    to={`/${dept.id}/tester`}
                    className={({ isActive }) => 'nav-subitem nav-subitem-tester' + (isActive ? ' active' : '')}
                  >
                    <span className="nav-subitem-icon">🧪</span>
                    <span className="nav-subitem-label">Tester</span>
                  </NavLink>
                  {dept.id === 'sales' && (
                    <NavLink
                      to={`/${dept.id}/dossier`}
                      className={({ isActive }) => 'nav-subitem nav-subitem-dossier' + (isActive ? ' active' : '')}
                    >
                      <span className="nav-subitem-icon">⭐</span>
                      <span className="nav-subitem-label">Dossier</span>
                    </NavLink>
                  )}
                  {hasProcesses && <div className="nav-subitem-divider" />}
                  {processes.map((proc) => (
                    <NavLink
                      key={proc.id}
                      to={`/${dept.id}/${proc.id}`}
                      className={({ isActive }) => 'nav-subitem' + (isActive ? ' active' : '')}
                    >
                      <span className="nav-subitem-dot"></span>
                      <span className="nav-subitem-label">{proc.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">v1.0.0 · 11 Depts · 120+ Processes</div>
        <div style={{ textAlign: 'center' }}>
          <span className="sidebar-env">PRODUCTION</span>
        </div>
      </div>
    </aside>
  );
}
