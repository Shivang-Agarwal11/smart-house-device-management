import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiServices'; // Ensure apiService is correctly imported
import PowerIcon from '@mui/icons-material/Power'; // MUI Icon for power status
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Typography, Paper, Grid, IconButton, Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { commandMappings } from '../utils/commandMappings';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [error, setError] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [usageDetails, setUsageDetails] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(true); // St
    const [updatedDevice, setUpdatedDevice] = useState({
        name: '',
        location: '',
        model: '',
        watts: ''
    });
    const [commandDetails, setCommandDetails] = useState({});

    const [deviceDateRange, setDeviceDateRange] = useState({}); // State to store date range per device

    // Fetch devices on component mount
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await apiService.getDevices(); // Call the API to fetch devices
                setDevices(response.data.data.devices); // Update the devices state
            } catch (err) {
                console.error("Error fetching devices:", err);
                setError("Failed to fetch devices.");
            }
        };
        fetchDevices();
    }, []);
    const fetchDevices2 = async () => {
        try {
            const response = await apiService.getDevices(); // Call the API to fetch devices
            setDevices(response.data.data.devices); // Update the devices state
        } catch (err) {
            console.error("Error fetching devices:", err);
            setError("Failed to fetch devices.");
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        try {
            await apiService.deleteDevice(deviceId); // Delete device
            setDevices(devices.filter(device => device._id !== deviceId)); // Remove deleted device from state
        } catch (err) {
            console.error("Error deleting device:", err);
            setError("Failed to delete device.");
        }
    };

    const handleEditDevice = (device) => {
        setUpdatedDevice({
            name: device.name,
            location: device.location,
            model: device.model,
            watts: device.watts
        });
        setSelectedDevice(device);
        setOpenDialog(true);
    };

    const handleExecuteCommand = async (device) => {
        try {
            const deviceId = device._id;
            const category = device.category;
            const { command, value } = commandDetails[device._id];
            console.log(commandDetails[deviceId])
            const response = await apiService.executeCommand(deviceId, category, command, value);
            await fetchDevices2();
            // setError(`Command executed successfully: ${response.data.message}`);
        } catch (err) {
            console.error("Error executing command:", err);
            setError("Failed to execute command.");
        }
    };

    const handleUpdateDevice = async () => {
        try {
            const response = await apiService.updateDevice(selectedDevice._id, updatedDevice); // Update device details
            setDevices(devices.map(device =>
                device._id === selectedDevice._id ? { ...device, ...updatedDevice } : device
            ));
            setOpenDialog(false);
        } catch (err) {
            console.error("Error updating device:", err);
            setError("Failed to update device.");
        }
    };

    const handleGetUsageDetails = async (deviceId) => {
        const deviceRange = deviceDateRange[deviceId]; // Get the date range for the specific device
        if (!deviceRange?.startDate || !deviceRange?.endDate) {
            setError("Please select a date range.");
            return;
        }

        try {
            // Format dates to string (e.g., '2024-12-04')
            const startTime = deviceRange.startDate.toISOString().split('T')[0];
            const endTime = deviceRange.endDate.toISOString().split('T')[0];

            const response = await apiService.getDeviceUsage(deviceId, startTime, endTime); // Get usage details for device
            setUsageDetails(response.data.usage); // Update usage details state
        } catch (err) {
            console.error("Error fetching usage details:", err);
            setError("Failed to fetch usage details.");
        }
    };

    const handleDateChange = (deviceId, dateType, dateValue) => {
        // Update the date range for the specific device
        setDeviceDateRange((prevState) => ({
            ...prevState,
            [deviceId]: {
                ...prevState[deviceId],
                [dateType]: dateValue
            }
        }));
    };

    const handleAnalyticsReport = (deviceId) => {
        // Navigate to the analytics page, passing the deviceId as a parameter if needed
        navigate(`/analytics/${deviceId}`);
    };
    
    const getCommandOptions = (category) => {
        // Get the available commands for a device category
        const categoryCommands = commandMappings[category] || {};
        return Object.keys(categoryCommands).map(command => ({
            command,
            description: categoryCommands[command].description,
            values: categoryCommands[command].values,
            type: categoryCommands[command].type
        }));
    };
    const handleLogout = async () => {
        // Perform any necessary logout logic here, such as clearing session or token
        setIsLoggedIn(false); // Update login status to false
        await apiService.logout();
        localStorage.clear();
        navigate('/'); // Navigate to login page
    };

    const getValueComponent = (device, command) => {
        const deviceId = device._id;
        const selectedCommand = commandMappings[device?.category]?.[command];
        if (!selectedCommand) return null;

        switch (selectedCommand.type) {
            case 'boolean':
                return (
                    <FormControl fullWidth sx={{ p: 1 }}>
                        <InputLabel>Value</InputLabel>
                        <Select
                            value={commandDetails[deviceId]?.value}
                            onChange={(e) => handleCommandValueChange(device._id, commandDetails[deviceId]?.command, e.target.value)}
                        >
                            {selectedCommand.values.map((val, idx) => (
                                <MenuItem key={idx} value={val}>{val ? 'On' : 'Off'}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 'range':
                return (
                    <TextField
                        label="Value"
                        type="number"
                        value={commandDetails[deviceId]?.value || ''}
                        onChange={(e) => handleCommandValueChange(device._id, commandDetails[deviceId]?.command, e.target.value,)}
                        fullWidth
                        inputProps={{
                            min: selectedCommand.values.min,
                            max: selectedCommand.values.max
                        }}
                        sx={{ p: 1 }}
                    />
                );
            case 'speed':
                return (
                    <FormControl fullWidth sx={{ p: 1 }}>
                        <InputLabel>Fan Speed</InputLabel>
                        <Select
                            value={commandDetails[deviceId]?.value || ''}
                            onChange={(e) => handleCommandValueChange(device._id, commandDetails[deviceId]?.command, e.target.value,)}
                        >
                            {selectedCommand.values.map((val, idx) => (
                                <MenuItem key={idx} value={val}>{val}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 'state':
                return (
                    <FormControl fullWidth sx={{ p: 1 }}>
                        <InputLabel>State</InputLabel>
                        <Select
                            value={commandDetails[deviceId]?.value || ''}
                            onChange={(e) => handleCommandValueChange(device._id, commandDetails[deviceId]?.command, e.target.value,)}
                        >
                            {selectedCommand.values.map((val, idx) => (
                                <MenuItem key={idx} value={val}>{val}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 'temperature':
                return (
                    <FormControl fullWidth>
                        <InputLabel>Mode</InputLabel>
                        <Select
                            value={commandDetails[deviceId]?.value || ''}
                            onChange={(e) => handleCommandValueChange(device._id, commandDetails[deviceId]?.command, e.target.value,)}
                        >
                            {selectedCommand.values.map((val, idx) => (
                                <MenuItem key={idx} value={val}>{val}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            default:
                return null;
        }
    };
    const handleRegisterDevice=()=>{
        navigate('/register-device')
    }
    const handleCommandValueChange = (deviceId, command, value) => {
        setCommandDetails((prevState) => ({
            ...prevState,
            [deviceId]: {
                ...prevState[deviceId],
                command,
                value
            }
        }));
    };

    return (
        <div className="main-container">
            <h1>Welcome to the Smart House Management Dashboard</h1>

            {/* Navigation Links */}
            <nav>
                {isLoggedIn ? (
                    <Button onClick={handleLogout} variant="contained" color="primary">Log Out</Button>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
                <Button onClick={handleRegisterDevice} variant='contained' color='primary'>Register Device</Button>
            </nav>


            {/* Error Message */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Devices Table */}
            <Box sx={{ my: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Registered Devices
                </Typography>

                {devices.length > 0 ? (
                    <Grid container spacing={3}>
                        {devices.map((device) => (
                            <Grid item xs={12} key={device._id}> {/* Ensure full width of each device */}
                                <Paper elevation={3} sx={{ p: 2 }}>
                                    <Typography variant="h6">{device.name}</Typography>
                                    <Typography variant="body2">
                                        <strong>Location:</strong> {device.location}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Type:</strong> {device.category}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Device Identifier:</strong> {device.device_identifier}
                                    </Typography>
                                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <strong>Status:</strong>
                                        <IconButton sx={{
                                            '&:hover': { color: 'green' },
                                        }}>
                                            <PowerIcon sx={{ color: device.isOn ? 'green' : 'red' }} />
                                        </IconButton>
                                        <Button
                                            onClick={() => handleEditDevice(device)}
                                            startIcon={<EditIcon />}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: '#d3d3d3',
                                                    color: '#000',
                                                },
                                                marginLeft: '8px'
                                            }}>
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteDevice(device._id)}
                                            startIcon={<DeleteIcon />}
                                            color="error"
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: '#ffcccc',
                                                    color: 'red',
                                                },
                                                marginLeft: '8px'
                                            }}>
                                            Delete
                                        </Button>
                                        <Button
                                            onClick={() => handleGetUsageDetails(device._id)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: '#d3d3d3',
                                                    color: '#000',
                                                },
                                                marginLeft: '8px'
                                            }}>
                                            Get Usage
                                        </Button>
                                        <Button
                                            onClick={() => handleAnalyticsReport(device._id)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: '#d3d3d3',
                                                    color: '#000',
                                                },
                                                marginLeft: '8px'
                                            }}>
                                            Get Analytics Report
                                        </Button>
                                        {/* Date Range Picker */}
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <DatePicker
                                                label="Start Date"
                                                value={deviceDateRange[device._id]?.startDate || null}
                                                onChange={(date) => handleDateChange(device._id, 'startDate', date)}
                                                renderInput={(params) => <TextField {...params} />}
                                            />
                                            <DatePicker
                                                label="End Date"
                                                value={deviceDateRange[device._id]?.endDate || null}
                                                onChange={(date) => handleDateChange(device._id, 'endDate', date)}
                                                renderInput={(params) => <TextField {...params} />}
                                            />
                                        </LocalizationProvider>
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <FormControl fullWidth sx={{ p: 1 }}>
                                            <InputLabel>Command</InputLabel>
                                            <Select
                                                value={commandDetails[device._id]?.command || ''}
                                                onChange={(e) => handleCommandValueChange(device._id, e.target.value, '')}
                                            >
                                                {getCommandOptions(device.category).map((cmd) => (
                                                    <MenuItem key={cmd.command} value={cmd.command}>
                                                        {cmd.description}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {/* Dynamic Value Input */}
                                        {getValueComponent(device, commandDetails[device._id]?.command)}
                                    </Box>

                                    {/* Execute Command */}
                                    <Button
                                        onClick={() => handleExecuteCommand(device)}
                                        variant="contained"
                                        sx={{ mt: 2 }}
                                    >
                                        Execute Command
                                    </Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography>No devices found.</Typography>
                )}
            </Box>

            {/* Usage Details Dialog */}
            <Dialog open={usageDetails.length > 0} onClose={() => setUsageDetails([])}>
                <DialogContent>
                    <Typography variant="h6">Device Usage</Typography>
                    {usageDetails.length > 0 ? (
                        <div sx={{ padding: "10px" }}>
                            {usageDetails.map((usage) => (
                                <Box key={usage._id} sx={{ mb: 2, p: 1, border: "2px solid black" }}>
                                    <Typography variant="body2">Start Time: {new Date(usage.startTime).toLocaleString()}</Typography>
                                    <Typography variant="body2">End Time: {new Date(usage.endTime).toLocaleString()}</Typography>
                                    <Typography variant="body2">Energy Consumed: {usage.energyConsumed} Wh</Typography>
                                </Box>
                            ))}
                        </div>
                    ) : (
                        <Typography>No usage data available.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUsageDetails([])} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Device Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogContent>
                    <Typography variant="h6">Edit Device</Typography>
                    <TextField
                        label="Name"
                        value={updatedDevice.name}
                        onChange={(e) => setUpdatedDevice({ ...updatedDevice, name: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Location"
                        value={updatedDevice.location}
                        onChange={(e) => setUpdatedDevice({ ...updatedDevice, location: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Model"
                        value={updatedDevice.model}
                        onChange={(e) => setUpdatedDevice({ ...updatedDevice, model: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Watts"
                        value={updatedDevice.watts}
                        onChange={(e) => setUpdatedDevice({ ...updatedDevice, watts: e.target.value })}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateDevice} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Dashboard;
