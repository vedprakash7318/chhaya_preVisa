import React from 'react';
import './StyleCss/Sidebar.css';
import {
  FaUserCheck,   // Verify Leads
  FaBriefcase,   // Add Jobs
  FaListAlt,     // Give Options
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { icon: <MdDashboard />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FaUserCheck />, label: 'Verify Leads', path: '/verify-leads' },
    { icon: <FaBriefcase />, label: 'Add Jobs', path: '/jobs' },
    { icon: <FaListAlt />, label: 'Give Options', path: '/give-option' },
  ];

  return (
    <div className={`admin-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <ul>
        {menu.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <li
              key={i}
              className={isActive ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              <span className="admin-icon">{item.icon}</span>
              <span className="admin-label">{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
