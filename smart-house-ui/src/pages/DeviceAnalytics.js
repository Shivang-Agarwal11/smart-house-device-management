import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiServices';

const DeviceAnalytics=()=> {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setError(null);
        const data = await apiService.getDeviceAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        setError(`Error: ${err.response?.data?.message || err.message}`);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="main-container">
      <h2>Device Analytics</h2>
      {error && <p className="error">{error}</p>}
      {analyticsData ? (
        <div>
          <h3>Analytics Overview</h3>
          <pre>{JSON.stringify(analyticsData, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading analytics...</p>
      )}
    </div>
  );
}

export default DeviceAnalytics;
