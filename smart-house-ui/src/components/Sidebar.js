import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/register-device">Register Device</Link></li>
        <li><Link to="/device-usage">Device Usage</Link></li>
        <li><Link to="/device-analytics">Device Analytics</Link></li>
        <li><Link to="/device-commands">Device Commands</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
