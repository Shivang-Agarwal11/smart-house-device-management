
const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/analytics', proxy('http://localhost:8084'))
app.use('/api/v1/device-control', proxy('http://localhost:8083'))
app.use('/api/v1/device-register', proxy('http://localhost:8082'))
app.use('/api/v1/user', proxy('http://localhost:8081'))

app.listen(8080, () => {
    console.log('Gateway is Listening to Port 8080')
})
