import React, { useState } from 'react';
import { apiService } from '../services/apiServices';
import { TextField, Button, Grid, Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 

const Signup = () => {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignup = async (event) => {
      event.preventDefault(); // Prevent the default form submission behavior
      setError(""); // Clear any previous errors
      try {
        const response = await apiService.signup(formData); // Call the login API
        console.log("SignUp successful:", response);
        // Handle successful login (e.g., save token, redirect)
        navigate('/dashboard');
      } catch (error) {
        console.error("Login failed:", error);
        setError("Invalid username or password");
      }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Email"
              variant="outlined"
              type="email"
              fullWidth
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Contact Number"
              variant="outlined"
              type="tel"
              fullWidth
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSignup}
            >
              Sign Up
            </Button>
          </Grid>
        </Grid>

        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {success && <Typography color="success" sx={{ mt: 2 }}>{success}</Typography>}
      </Box>
    </Container>
  );
};

export default Signup;
