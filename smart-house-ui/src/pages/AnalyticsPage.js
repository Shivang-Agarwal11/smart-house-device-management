import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Grid, Box, Typography, Container, Paper } from '@mui/material';
import { apiService } from '../services/apiServices';  // Adjust the import path as needed

const AnalyticsReport = () => {
  const { deviceId } = useParams();  // Get deviceId from URL
  const [analytics, setAnalytics] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [startDate, setStartDate] = useState('2024-11-23');
  const [endDate, setEndDate] = useState('2024-12-06');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateError, setDateError] = useState('');  // To store error for date range

  const handleFetchAnalytics = async () => {
    if (new Date(startDate) > new Date(endDate)) {
      setDateError('End date cannot be before start date.');
      return;
    } else {
      setDateError('');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAnalyticsReport(deviceId, startDate, endDate);
      setAnalytics(response.data.analytics);
      setMaintenance(null); // Clear maintenance data when fetching analytics
      setCarbonFootprint(null); // Clear carbon footprint data when fetching analytics
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMaintenance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMaintenanceReport(deviceId);
      setMaintenance(response.data);
      setAnalytics(null); // Clear analytics data when fetching maintenance data
      setCarbonFootprint(null); // Clear carbon footprint data when fetching maintenance data
    } catch (err) {
      setError('Failed to fetch maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCarbonFootprint = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getCarbonFootprint(deviceId, startDate, endDate);
      setCarbonFootprint(response.data);
      setAnalytics(null); // Clear analytics data when fetching carbon footprint data
      setMaintenance(null); // Clear maintenance data when fetching carbon footprint data
    } catch (err) {
      setError('Failed to fetch carbon footprint data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch analytics data when the component mounts or date range changes
    handleFetchAnalytics();
  }, [deviceId, startDate, endDate]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Device Analytics Report
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFetchAnalytics}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Get Analytics'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFetchMaintenance}
              disabled={loading}
              sx={{ ml: 2 }}
            >
              {loading ? 'Loading...' : 'Get Maintenance'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFetchCarbonFootprint}
              disabled={loading}
              sx={{ ml: 2 }}
            >
              {loading ? 'Loading...' : 'Get Carbon Footprint'}
            </Button>
          </Grid>
        </Grid>

        {dateError && <Typography color="error" sx={{ mt: 2 }}>{dateError}</Typography>}

        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

        {/* Show Analytics Data */}
        {analytics && (
          <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6">Analytics for Device {analytics.name}</Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">Total Power Consumption: {analytics.totalPowerConsumption} kWh</Typography>
                <Typography variant="body1">Total Usage Time: {analytics.totalUsageTime} hours</Typography>
                <Typography variant="body1">Peak Power Usage: {analytics.peakPowerUsage} kWh</Typography>
                <Typography variant="body1">Avg Power Consumption: {analytics.avgPowerConsumption} W</Typography>
                <Typography variant="body1">Carbon Consumption: {analytics.carbonConsumption} kg CO2</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body1">First Usage Time: {new Date(analytics.firstUsageTime).toLocaleString()}</Typography>
                <Typography variant="body1">Last Usage Time: {new Date(analytics.lastUsageTime).toLocaleString()}</Typography>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4 }}>Hourly Consumption</Typography>
            <Grid container spacing={2}>
              {analytics.hourlyData.map((data, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Typography variant="body2">
                    Hour {data.hour}: {data.consumption} kWh
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Show Maintenance Data */}
        {maintenance && (
          <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6">Maintenance Report for Device {maintenance.device}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">Category: {maintenance.category}</Typography>
                <Typography variant="body1">Maintenance Needed: {maintenance.maintenanceNeeded ? 'Yes' : 'No'}</Typography>
                <Typography variant="body1">Next Maintenance In: {maintenance.nextMaintenanceIn}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body1">Recommendations:</Typography>
                <ul>
                  {maintenance.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Show Carbon Footprint Data */}
        {carbonFootprint && (
          <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6">Carbon Footprint for Device {carbonFootprint.device}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">Carbon Consumption: {carbonFootprint.data.carbonConsumption} kg CO2</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body1">Reduction Suggestions:</Typography>
                <ul>
                  {carbonFootprint.data.reductionSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default AnalyticsReport;
