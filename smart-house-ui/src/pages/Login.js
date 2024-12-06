import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { apiService } from "../services/apiServices"; // Import the login function from API service
import { useNavigate } from 'react-router-dom'; 

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); 

  const handleSignUp = ()=>{
    navigate('/signup')
  }
  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    setError(""); // Clear any previous errors
    try {
      const response = await apiService.login({username, password}); // Call the login API
      console.log("Login successful:", response);
      // Handle successful login (e.g., save token, redirect)
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid username or password");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "30px",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "12px",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ marginBottom: "20px", fontWeight: "bold" }}
        >
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" sx={{ marginTop: "10px" }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ marginTop: "20px", padding: "10px", fontWeight: "bold" }}
          >
            Login
          </Button>
        </form>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSignUp}
            sx={{ marginTop: "20px", padding: "10px", fontWeight: "bold" }}
          >
            Sign up
          </Button>
      </Paper>
    </Box>
  );
};

export default Login;
