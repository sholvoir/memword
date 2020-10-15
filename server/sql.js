const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const _db_run = (dbname, method, sql, param) => new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, dbname));
    switch(method) {
        case 'run_i': db.run(sql, param, function(err) { err ? reject(err) : resolve({ lastID: this.lastID }) }); break;
        case 'run_ud': db.run(sql, param, function(err) { err ? reject(err) : resolve({ changes: this.changes }) }); break;
        case 'get': db.get(sql, param, (err, row) => err ? reject(err) : resolve(row)); break;
        case 'all': db.all(sql, param, (err, rows) => err ? reject(err) : resolve(rows)); break;
    }
    db.close();
});

const _dictDB = 'dict.db';
exports.selectDictByID = ({params}) => _db_run(_dictDB, 'get', `SELECT * FROM dict WHERE id = $id`, { $id: params.id });
exports.selectDictByVerGT = ({query}) => _db_run(_dictDB, 'all', `SELECT * FROM dict WHERE ver > $vergt`, { $vergt: query.vergt });

const _dictColumns = ['star', 'spell', 'sound', 'mean', 'ver'];
const _insertDict = `INSERT INTO dict (${_dictColumns.join(', ')}) VALUES (${_dictColumns.map(key => `$${key}`).join(', ')})`;
exports.insertDict = ({body}) => {
    const data = {};
    _dictColumns.forEach(key => data[`$${key}`] = body[key]);
    return _db_run(_dictDB, 'run_i', _insertDict, data);
}

const _dictColumnSet = new Set(_dictColumns);
exports.updateDictById = ({params, body}) => {
    const columns = Object.keys(body).filter(key => _dictColumnSet.has(key));
    const setStatement = columns.map(key => `${key} = $${key}`).join(', ');
    const data = { $id: params.id };
    columns.forEach(key => data[`$${key}`] = body[key]);
    return _db_run(_dictDB, 'run_ud', `UPDATE dict SET ${setStatement} WHERE id = $id`, data);
}

exports.selectStatusByDidType = ({user, params}) => _db_run(user.id, 'get', `SELECT * FROM status WHERE did = $did AND type = @type`, { $did: params.did, $type: params.type });
exports.selectStatusByLastGT = ({user, query}) => _db_run(user.id, 'all', `SELECT * FROM status WHERE last > $lastgt`, { $lastgt: query.lastgt });

const _statusColumns = ['level', 'hard', 'last', 'next'];
const _insertStatus = `INSERT INTO status (${_statusColumns.join(', ')}) VALUES (${_statusColumns.map(key => `$${key}`).join(', ')})`;
exports.insertStatus = ({user, body}) => {
    const data = {};
    _statusColumns.forEach(key => data[`$${key}`] = body[key]);
    return _db_run(user.id, 'run_i', _insertStatus, data);
}

const _statusColumnSet = new Set(_statusColumns);
exports.updateStatusByDidType = ({user, params, body}) => {
    const columns = Object.keys(body).filter(key => _statusColumnSet.has(key));
    const setStatement = columns.map(key => `${key} = $${key}`).join(', ');
    const data = { $did: params.did, $type: params.type };
    columns.forEach(key => data[`$${key}`] = body[key]);
    return _db_run(user.id, 'run_ud', `UPDATE status SET ${setStatement} WHERE did = $did AND type = $type`, data);
}
