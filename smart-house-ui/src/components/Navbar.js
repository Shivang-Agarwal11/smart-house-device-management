import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <h1>Smart House</h1>
      <button>Logout</button>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/register-device">Register Device</Link></li>
        <li><Link to="/device-usage">Device Usage</Link></li>
        <li><Link to="/device-analytics">Device Analytics</Link></li>
        <li><Link to="/device-commands">Device Commands</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
