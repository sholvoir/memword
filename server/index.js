const port = parseInt(process.argv[2] || 8080);

const express = require('express');
const app = express();

const auth = require('./auth');

app.get('/api/login', auth.login);
app.get('/api/renew', auth.renew);
app.use('/api/v1', require('./api-v1')(express.Router()));
app.listen(port, () => console.log(`Server has started at ${port}.`));