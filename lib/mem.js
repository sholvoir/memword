import * as local from './local.js';
import * as server from './server.js';
import { decode as jwtDecode } from 'djwt';

// times: 1m, 5m, 30m, 90m, 6h, 24h, 42h, 72h, 7d, 13d, 25d, 49d, 97d, 191d, 367d
const times = [60000, 300000, 1800000, 5400000, 21600000, 86400000,
    151200000, 259200000, 604800000, 1123200000, 2160000000, 4233600000,
    8380800000, 16502400000, 31708800000];
const eachEpisode = 20;

export const taskTypes = ['listen', 'speak', 'read', 'write'];
export const statItems = ['blevel', 'collins', 'bnc', 'frq', 'tag'];
export const taskType = task => taskTypes[task.id & 0x0F];
export const taskDictID = task => task.id >> 4;

/**
 * map level to blevel
 * @param {number} level 0 ~ 16
 * @returns {number} blevel:
 *    finished: >= 16
 *    skilled: 14, 15
 *    familiar: 11, 12, 13
 *    medium: 7, 8, 9, 10
 *    start: 1,2,3,4,5,6
 *    never: 0
 */
const toBLevel = (level) => {
    if (level > 15) return 5;
    if (level > 13) return 4;
    if (level > 10) return 3;
    if (level > 6) return 2;
    if (level > 0) return 1;
    return 0;
};

const tstatInitValue = () => ({
    all: 0,
    blevel: [0, 0, 0, 0, 0, 0],
    collins: [0, 0, 0, 0, 0, 0],
    bnc: [0, 0, 0, 0, 0, 0, 0, 0],
    frq: [0, 0, 0, 0, 0, 0, 0, 0],
    oxford: 0,
    zhongKao: 0,
    gaoKao: 0,
    kaoYan: 0,
    cet4: 0,
    cet6: 0,
    toefl: 0,
    ielts: 0,
    gre: 0
});

const tstatPP = (tstat, level, tag) => {
    tstat.all++;
    tstat.blevel[toBLevel(level)]++;
    tstat.collins[tag.collins]++;
    tstat.bnc[tag.bnc]++;
    tstat.frq[tag.frq]++
    tags.forEach(t => tag[t] && tstat[t]++);
};

export const statInitValue = () => {
    const stat = {};
    taskTypes.forEach(type => {
        stat[`${type}_task`] = tstatInitValue();
        stat[`${type}_value`] = tstatInitValue();
    });
    return stat;
};

export const tstatToStatItems = (task, value) => {
    const all = value.all;
    return all && {
        blevel: [
            { name: 'Finished', task: 0, value: value.blevel[5], all },
            { name: 'Skilled', task: task.blevel[4], value: value.blevel[4], all },
            { name: 'Familiar', task: task.blevel[3], value: value.blevel[3], all },
            { name: 'Medium', task: task.blevel[2], value: value.blevel[2], all },
            { name: 'Start', task: task.blevel[1], value: value.blevel[1], all },
            { name: 'Never', task: task.blevel[0], value: value.blevel[0], all }
        ],
        collins: [
            { name: 'Collins5', task: task.collins[5], value: value.collins[5], all },
            { name: 'Collins4', task: task.collins[4], value: value.collins[4], all },
            { name: 'Collins3', task: task.collins[3], value: value.collins[3], all },
            { name: 'Collins2', task: task.collins[2], value: value.collins[2], all },
            { name: 'Collins1', task: task.collins[1], value: value.collins[1], all },
            { name: 'Collins0', task: task.collins[0], value: value.collins[0], all }
        ],
        bnc: [
            { name: 'Bnc1', task: task.bnc[1], value: value.bnc[1], all },
            { name: 'Bnc2', task: task.bnc[2], value: value.bnc[2], all },
            { name: 'Bnc3', task: task.bnc[3], value: value.bnc[3], all },
            { name: 'Bnc4', task: task.bnc[4], value: value.bnc[4], all },
            { name: 'Bnc5', task: task.bnc[5], value: value.bnc[5], all },
            { name: 'Bnc6', task: task.bnc[6], value: value.bnc[6], all },
            { name: 'Bnc7', task: task.bnc[7], value: value.bnc[7], all },
            { name: 'Bnc0', task: task.bnc[0], value: value.bnc[0], all }
        ],
        frq: [
            { name: 'Frq1', task: task.frq[1], value: value.frq[1], all },
            { name: 'Frq2', task: task.frq[2], value: value.frq[2], all },
            { name: 'Frq3', task: task.frq[3], value: value.frq[3], all },
            { name: 'Frq4', task: task.frq[4], value: value.frq[4], all },
            { name: 'Frq5', task: task.frq[5], value: value.frq[5], all },
            { name: 'Frq6', task: task.frq[6], value: value.frq[6], all },
            { name: 'Frq7', task: task.frq[7], value: value.frq[7], all },
            { name: 'Frq0', task: task.frq[0], value: value.frq[0], all }
        ],
        tag: [
            { name: 'Oxford', task: task.oxford, value: value.oxford, all },
            { name: 'ZhongKao', task: task.zhongKao, value: value.zhongKao, all },
            { name: 'GaoKao', task: task.gaoKao, value: value.gaoKao, all },
            { name: 'KaoYan', task: task.kaoYan, value: value.kaoYan, all },
            { name: 'CET4', task: task.cet4, value: value.cet4, all },
            { name: 'CET6', task: task.cet6, value: value.cet6, all },
            { name: 'TOEFL', task: task.toefl, value: value.toefl, all },
            { name: 'IELTS', task: task.ielts, value: value.ielts, all },
            { name: 'GRE', task: task.gre, value: value.gre, all }
        ]
    };
};

export const setAccessToken = local.setAccessToken;
export const openDatabase = local.openDatabase;
export const login = server.login;

export const getEmail = () => {
    const token = local.getAccessToken();
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded && decoded.aud;
};

export const isTokenExpired = () => {
    const token = local.getAccessToken();
    if (!token) return true;
    const decoded = jwtDecode(token);
    if (!decoded) return true;
    const { exp } = decoded;
    if (!exp) return true;
    return exp < Date.now() / 1000;
};

export const getTaskFromServer = async () => {
    const lastStudyTime = local.getLastStudyTime() || 0;
    const tasks = await server.getTaskByLastgt(lastStudyTime);
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const taskLocal = await local.getTask(task.id);
        if (!taskLocal || task.last > taskLocal.last) {
            await local.putTask(task);
        }
    }
};

export const study = async (task) => {
    task.next = (task.last = Date.now()) + times[task.level++];
    task.unsync = true;
    local.setLastStudyTime(task.last);
    await local.putTask(task);
    await server.updateTask(task);
    delete task.unsync;
    await local.putTask(task);
};

export const renew = async () => {
    const result = await server.renew();
    local.setAccessToken(result.token);
    return true;
};

export const getStat = async () => {
    const stat = statInitValue();
    const ctime = Date.now();
    return await local.traversingTask(
        task => {
            const tag = int2Tag(task.tag);
            tstatPP(stat[`${taskType(task)}_value`], task.level, tag);
            if (task.next < ctime)
                tstatPP(stat[`${taskType(task)}_task`], task.level, tag);
            return true;
        }, () => stat
    );
};

export const getEpisode = async (func) => {
    const tasks = [];
    const ctime = Date.now();
    return await local.traversingTask(
        task => (func(task) && tasks.push(task), tasks.length < eachEpisode),
        () => tasks,
        'next',
        IDBKeyRange.upperBound(ctime)
    );
};

export const getDict = async (id) => {
    let dict = await local.getDict(id);
    if (dict) return dict;
    dict = await server.getDictById(id);
    await local.putDict(dict);
    if (dict.version > local.getDictVersion())
        local.setDictVersion(dict.version);
    return dict;
};