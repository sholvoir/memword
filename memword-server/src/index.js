const argv = require('yargs').alias('p', 'port').argv;
const port = parseInt(argv.port || 8080);
//const path = require('path');

const express = require('express');
const app = express();

const auth = require('./auth');
//app.use('*', auth.cors);
app.route('/memword/api/login').options(auth.optionsProcess).get(auth.login);
app.route('/memword/api/renew').options(auth.optionsProcess).get(auth.user, auth.renew);
app.use('/memword/api/v1', require('./api-v1')(express.Router()));

//const staticRoot = path.join(__dirname, '..', '..', '..', 'sholvoir.github.io', 'memword');
//app.use(express.static(staticRoot));

const server = app.listen(port, () => console.log(`Server has started at ${port}.`));

const dbm = require('./dbm');
dbm.autoClose(5 * 60 * 1000, 60 * 1000);
const cleanup = () => dbm.cleanup().then(() => server.close(() => process.exit())).catch(() => process.exit(1));

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// sholvoir.mooo.com ip auto update.
const fetch = require('node-fetch');
setInterval(async () => {
    if (!(await fetch('http://sync.afraid.org/u/F5nTFjszs55Hfp38SzWUu4hj/')).ok)
        console.log('update ip error!');
}, 10 * 60 * 1000);