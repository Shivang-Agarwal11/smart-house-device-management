import React, { useState } from 'react';
import { apiService } from '../services/apiServices';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; 

const RegisterDevice = () => {
  const navigate = useNavigate(); 
  const [deviceDetails, setDeviceDetails] = useState({
    name: '',
    device_identifier: '',
    build_number: '',
    model: '',
    location: '',
    watts: '',
    category: '',
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const categories = ['Lighting', 'Climate', 'Entertainment', 'Kitchen'];

  // Handle input change for all fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeviceDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Handle device registration
  const handleRegister = async () => {
    try {
      const payload = {
        ...deviceDetails,
        category: deviceDetails.category.toLowerCase(), // Convert category to lowercase
      };

      const response = await apiService.registerDevice(payload);
      setSuccess(response.data.message);
      setError(null);
      setDeviceDetails({
        name: '',
        device_identifier: '',
        build_number: '',
        model: '',
        location: '',
        watts: '',
        category: '',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Device registration failed');
      setSuccess(null);
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: '100vh', padding: '1rem' }}
    >
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper elevation={3} style={{ padding: '2rem', borderRadius: '10px' }}>
          <Typography variant="h4" gutterBottom align="center">
            Register Device
          </Typography>

          {/* Form Fields */}
          <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Device Name"
              name="name"
              value={deviceDetails.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Device Identifier"
              name="device_identifier"
              value={deviceDetails.device_identifier}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Build Number"
              name="build_number"
              value={deviceDetails.build_number}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Model"
              name="model"
              value={deviceDetails.model}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Location"
              name="location"
              value={deviceDetails.location}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Watts"
              name="watts"
              value={deviceDetails.watts}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              select
              label="Category"
              name="category"
              value={deviceDetails.category}
              onChange={handleChange}
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              color="primary"
              onClick={handleRegister}
              fullWidth
            >
              Register
            </Button>
          </Box>

          {/* Success/Failure Messages */}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default RegisterDevice;
