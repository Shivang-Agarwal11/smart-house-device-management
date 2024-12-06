import React, { useState } from 'react';
import { apiService } from '../services/apiServices';

const DeviceCommands=()=> {
  const [command, setCommand] = useState('');
  const [value, setValue] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSendCommand = async () => {
    try {
      const response = await apiService.sendDeviceCommand({ command, value });
      setSuccess(response.data.message);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send command');
      setSuccess(null);
    }
  };

  return (
    <div className="main-container">
      <h2>Send Device Commands</h2>
      <input
        type="text"
        placeholder="Command"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />
      <input
        type="text"
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleSendCommand}>Send Command</button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default DeviceCommands;
