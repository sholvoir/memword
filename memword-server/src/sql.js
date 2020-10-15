const { generalData, selectClause, insertClause, insertOrUpdateClause, updateClause } = require('./sqlite-util');
const run = require('./dbm').run;
const tag = require('./tag');

// dict
const _dictColumns = ['version', 'tag', 'word', 'sw', 'phonetic', 'definition',
    'translation', 'position', 'morphology', 'examples', 'audio', 'picture'];
const _insertDict = insertClause('dict', _dictColumns);
const _dictQueryParameters = {
    versiongt: 'version > $versiongt',
    word: 'word = $word',
    sw: 'sw = $sw',
    frq: `(tag & ${tag.FRG}) = $frq`,
    bnc: `((tag & ${tag.BNC}) >> 3) = $bnc`,
    collins: `((tag & ${tag.COLLINS}) >> 6) = $collins`,
    oxford: `((NOT (tag & ${tag.OXFORD})) = (NOT $oxford))`,
    zhongkao: `((NOT (tag & ${tag.ZHONG_KAO})) = (NOT $zhongkao))`,
    gaokao: `((NOT (tag & ${tag.GAO_KAO})) = (NOT $gaokao))`,
    kaoyan: `((NOT (tag & ${tag.KAO_YAN})) = (NOT $kaoyan))`,
    cet4: `((NOT (tag & ${tag.CET4})) = (NOT $cet4))`,
    cet6: `((NOT (tag & ${tag.CET6})) = (NOT $cet6))`,
    toefl: `((NOT (tag & ${tag.TOEFL})) = (NOT $toefl))`,
    ielts: `((NOT (tag & ${tag.IELTS})) = (NOT $ielts))`,
    gre: `((NOT (tag & ${tag.GRE})) = (NOT $gre))`
};

const selectDictById = ($id) =>
    run('dict', 'get', `SELECT * FROM dict WHERE id = $id;`, { $id });
const selectDict = ({query}) =>
    run('dict', 'all', ...selectClause('dict', _dictQueryParameters, query));
const insertDict = ({body}) =>
    run('dict', 'run', _insertDict, generalData(_dictColumns, body, {}));
const updateDictById = ({params, body}) =>
    run('dict', 'run', ...updateClause('dict', ['id'], _dictColumns, params, body));

// task
const _taskKeys = ['id']
const _taskColumns = ['level', 'last', 'next', 'tag'];
const _insertOrUpdateTask = insertOrUpdateClause('task', _taskKeys.concat(_taskColumns));
const selectTaskById = ({params}, {user}) =>
    run(user.id, 'get', `SELECT * FROM task WHERE id = $id;`, { $id: params.id });
const selectTaskByLastGT = ({query}, {user}) =>
    run(user.id, 'all', `SELECT * FROM task WHERE last > $lastgt;`, { $lastgt: query.lastgt });
const insertOrUpdateTask = ({params, body}, {user}) =>
    run(user.id, 'run', _insertOrUpdateTask, generalData(_taskColumns, body, generalData(_taskKeys, params, {})));

//
module.exports = {
    selectDictById, selectDict, insertDict, updateDictById,
    selectTaskById, selectTaskByLastGT, insertOrUpdateTask
};
