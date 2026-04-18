import { NavLink } from 'react-router-dom';
import { departments } from '../data/departments';
import '../styles/sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">CPG</div>
        <div>
          <div className="sidebar-title">CPG Analytics</div>
          <div style={{ fontSize: '10px', color: 'rgba(226,232,240,0.45)', marginTop: '1px' }}>AI Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {departments.map((dept) => (
          <NavLink
            key={dept.id}
            to={dept.route}
            end={dept.route === '/'}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <span className="nav-item-icon">{dept.icon}</span>
            <span className="nav-item-label">{dept.name}</span>
            {dept.processCount > 0 && (
              <span className="nav-item-badge">{dept.processCount}</span>
            )}
          </NavLink>
        ))}
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
