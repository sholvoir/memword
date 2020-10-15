const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dataPath = path.join(__dirname, '..', 'data');

const createDictTable = `CREATE TABLE dict (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    version     INTEGER NOT NULL,
    tag         INTEGER NOT NULL DEFAULT (0),
    word        TEXT    NOT NULL UNIQUE,
    sw          TEXT    COLLATE NOCASE NOT NULL,
    phonetic    TEXT,
    definition  TEXT,
    translation TEXT,
    position    TEXT,
    morphology  TEXT,
    examples    TEXT,
    audio       TEXT,
    picture     TEXT
);`;
const createDictWordIndex = 'CREATE UNIQUE INDEX [wordIndex] ON dict (word);'
const createDictVersionIndex = 'CREATE INDEX [versionIndex] ON dict (version);';

const createTaskTable = `CREATE TABLE task (
    id      INTEGER     PRIMARY KEY     NOT NULL        DEFAULT (0),
    level   INTEGER     NOT NULL        DEFAULT (0),
    last    INTEGER     NOT NULL        DEFAULT (0),
    next    INTEGER     NOT NULL        DEFAULT (0),
    tag    INTEGER     NOT NULL        DEFAULT (0)
);`;
const createTaskLastIndex = 'CREATE INDEX [lastIndex] ON task (last ASC);';
const createTaskNextIndex = 'CREATE INDEX [nextIndex] ON task (next DESC);';

const dbs = {};
let stopping = false;

const autoClose = (keepTime, interval) => setInterval(async () => {
    try {
        const now = Date.now();
        const closing = Object.keys(dbs)
            .filter(dbname => now - dbs[dbname].timestamp > keepTime)
            .map(dbname => run(dbname, 'close'));
        for await (const dbname of closing) {
            delete dbs[dbname];
        }
    } catch (err) { console.error(err); }
}, interval);

const getDB = (dbname) => {
    const dbinfo = dbs[dbname];
    if (dbinfo) {
        dbinfo.timestamp = Date.now();
        return dbinfo.db;
    } else {
        if (stopping) return null;
        const dbfile = path.join(dataPath, dbname + '.db');
        const existDbFile = fs.existsSync(dbfile);
        const db = new sqlite3.Database(dbfile);
        dbs[dbname] = { timestamp: Date.now(), db };
        if (!existDbFile) {
            db.serialize();
            if (dbname == 'dict') {
                db.run(createDictTable);
                db.run(createDictWordIndex);
                db.run(createDictVersionIndex);
            } else {
                db.run(createTaskTable);
                db.run(createTaskLastIndex);
                db.run(createTaskNextIndex);
            }
        }
        return db;
    }
};

const cleanup = () => {
    stopping = true;
    return Promise.all(Object.keys(dbs).map(dbname => run(dbname, 'close'))).then(() => dbs = {});
};

const run = (dbname, method, sql, param) => new Promise((resolve, reject) => {
    switch (method) {
        case 'run': getDB(dbname).run(sql, param, function (err) { err ? reject(err) : resolve([this.lastID, this.changes]) }); break;
        case 'get': getDB(dbname).get(sql, param, (err, row) => err ? reject(err) : resolve(row)); break;
        case 'all': getDB(dbname).all(sql, param, (err, rows) => err ? reject(err) : resolve(rows)); break;
        case 'close': getDB(dbname).close(err => err ? reject(`Database(${dbname}) Close Error: ${err}`) : resolve(dbname)); break;
    }
});

module.exports = { dataPath, cleanup, run, autoClose, getDB }