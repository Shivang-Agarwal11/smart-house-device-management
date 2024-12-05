const express = require('express');
const cors = require('cors');
const fs = require('fs');
const yaml = require('js-yaml');
require('./database/connect');

const deviceRouter = require('./router/device.router');
const { stringify } = require('querystring');
const path = require('path');

const app = express();
const port = process.env.PORT || 8081; // Default to port 5000 if not set in the environment
const host = process.env.HOST || "http://localhost"

// Swagger setup
const apiVersionPrefix = '/api/v1';

// Middleware for parsing JSON and enabling CORS
app.use(express.json());
app.use(cors());


// Define routes
app.use('/', deviceRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
