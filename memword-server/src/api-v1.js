
const auth = require('./auth');
const jsonParser = require('body-parser').json();
const sql = require('./sql');
const mw = require('./mw');

const process = (func) => async (req, res) => {
    try {
        res.status(200).json(await func(req, res.locals));
    } catch (err) {
        res.status(510).json(err);
    }
}

module.exports = (router) => {
    router.route('/dict')
        .options(auth.optionsProcess)
        .get(process(sql.selectDict))
        .post(auth.user, auth.admin, jsonParser, process(sql.insertDict));
    router.route('/dict/:id')
        .options(auth.optionsProcess)
        .get(process(mw.getDictById))
        .patch(auth.user, auth.admin, jsonParser, process(sql.updateDictById));
    router.route('/task')
        .options(auth.optionsProcess)
        .get(auth.user, process(sql.selectTaskByLastGT));
    router.route('/task/:id')
        .options(auth.optionsProcess)
        .get(auth.user, process(sql.selectTaskById))
        .put(auth.user, jsonParser, process(sql.insertOrUpdateTask));
    return router;
}