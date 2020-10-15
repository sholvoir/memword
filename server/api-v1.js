
const auth = require('./auth');
const sql = require('./sql');

const optionsProcess = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.send();
}

const sqlProcess = (sqlFunc) => (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    sqlFunc(req).then(results => {
        if (results) res.json(results);
        else res.send();
    }).catch(err => {
        if (err.message) console.error(err.message);
        if (err.stack) console.error(err.stack);
        res.status(510).json(err);
    });
}

module.exports = (router) => {
    router.route('dict')
        .options(optionsProcess)
        .get(sqlProcess(sql.selectDictByVertGT))
        .post(auth.admin, sqlProcess(sql.insertDict));
    router.route('dict/:id')
        .options(optionsProcess)
        .get(sqlProcess(sql.selectDictById))
        .patch(auth.admin, sqlProcess(sql.updateDictById));
    router.route('status')
        .options(auth.user, optionsProcess)
        .get(auth.user, sqlProcess(sql.selectStatusByLastGT))
        .post(auth.user, sqlProcess(sql.insertStatus));
    router.route('status/:did/:type')
        .options(auth.user, optionsProcess)
        .get(auto.user, sqlProcess(sql.selectStatusByDidType))
        .patch(auto.user, sqlProcess(sql.updateStatusByDidType));
    return router;
}