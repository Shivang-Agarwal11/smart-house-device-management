const express = require('express');
const cors = require('cors');
require('./database/connect');

const usageRouter = require('./router/usage.router');



const app = express();
const port = process.env.PORT || 8084; // Default to port 5000 if not set in the environment
const host = process.env.HOST || "http://localhost"

// Swagger setup
const apiVersionPrefix = '/api/v1';

// Middleware for parsing JSON and enabling CORS
app.use(express.json());
app.use(cors());


// Define routes
app.use('/', usageRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
