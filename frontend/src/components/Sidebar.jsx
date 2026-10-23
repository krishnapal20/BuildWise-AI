import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/safety', label: 'Safety Analysis', icon: '🛡️' },
  { path: '/crack', label: 'Crack Diagnosis', icon: '🔍' },
  { path: '/planning', label: 'Project Planner', icon: '📋' },
  { path: '/valuation', label: 'Property Valuation', icon: '🏘️' },
  { path: '/assistant', label: 'Daily Assistant', icon: '📆' },
  { path: '/weather', label: 'Weather Advisory', icon: '🌤️' },
  { path: '/knowledge', label: 'Knowledge Hub', icon: '📚' },
  { path: '/chat', label: 'AI Chat', icon: '💬' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo-container">
        <span className="sidebar-logo-icon">🏗️</span>
        <span className="sidebar-logo-text">BuildWise AI</span>
      </div>
      <div className="sidebar-divider" />
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        BuildWise AI v1.0.0
      </div>
    </aside>
  );
}
