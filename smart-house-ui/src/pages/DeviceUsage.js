import React, { useState } from 'react';
import { apiService } from '../services/apiServices';

const DeviceUsage=()=> {
  const [deviceId, setDeviceId] = useState('');
  const [usageData, setUsageData] = useState(null);
  const [error, setError] = useState(null);

  const handleFetchUsage = async () => {
    try {
      setError(null);
      const data = await apiService.getDeviceUsage(deviceId);
      setUsageData(data);
    } catch (err) {
      setError(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="main-container">
      <h2>Device Usage</h2>
      <input
        type="text"
        placeholder="Enter Device ID"
        value={deviceId}
        onChange={(e) => setDeviceId(e.target.value)}
      />
      <button onClick={handleFetchUsage}>Fetch Usage</button>
      {error && <p className="error">{error}</p>}
      {usageData && (
        <div className="usage-table">
          <h3>Usage Data</h3>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {usageData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.time}</td>
                  <td>{entry.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DeviceUsage;
