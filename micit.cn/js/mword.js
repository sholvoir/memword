/**
 * Author:  Sovar He
 * type:    "listen","speak","read","write"
 * level:   0~15
 * Blevel:  0~4, 0:0, 1:1-6, 2:7-10, 3:11-13, 4:14-15
 * Hard:    0~4
 * times:   0, 1m, 5m, 30m, 90m, 6h, 24h, 42h, 72h,
 *          7d, 13d, 25d, 49d, 97d, 191d, 367d
 * stat:    0:all,
 *          1-5:blevel0-4,
 *          6:hard,
 *          7-12:star0-5
 */
class MOption {
    constructor() {
        this.levels = [0, 1, 7, 11, 14];
        this.episodeInsert = [1, 4, 9];
        this.episodeInsertTimes = [3, 3, 3, 2, 1];
        this.nextTimes = [0, 60000, 300000, 1800000, 5400000, 21600000, 86400000,
            151200000, 259200000, 604800000, 1123200000, 2160000000, 4233600000,
            8380800000, 16502400000, 31708800000];
        this.colors = ["darkred", "blue", "orange", "olive", "forestgreen", "darkgray"];
    }
}
class MWord {
    constructor(word, type, level, hard, last, next) {
        this.word = word;
        this.type = type;
        this.level = level;
        this.hard = hard;
        this.last = last;
        this.next = next;
    }
}
class MDict {
    constructor(word, star, phonic, sound, concept, ver) {
        this.word = word;
        this.star = star;
        this.phonic = phonic;
        this.sound = sound;
        this.concept = concept;
        this.ver = ver;
    }
}
class MSearch {
    constructor(patten) {
        this.patten = patten;
        this.top = 20;
        this.levelmin = 0;
        this.levelmax = 100;
        this.hardmin = 0;
        this.hardmax = 100;
        this.lastmin = 0;
        this.lastmax = Infinity;
        this.nextmin = 0;
        this.nextmax = Infinity;
        this.starmin = 0;
        this.starmax = 100;
    }
}
function mwGetBLevel(level) {
    if (0 >= level)
        return 0;
    if (6 >= level)
        return 1;
    if (10 >= level)
        return 2;
    if (13 >= level)
        return 3;
    return 4;
}
function mwDefaultWord(word) {
    let t = new Date().getTime();
    return new MWord(word, "listen", 0, 0, t, t);
}
function mwordParse(mwordstr) {
    if ("string" !== typeof mwordstr)
        return null;
    let x = mw.pattern.exec(mwordstr);
    if (null !== x)
        return JSON.parse(mwordstr);
    else
        return mwDefaultWord(mwordstr);
}
function mwTimeToString(time) {
    let remain = Math.floor(time / 86400000);
    if (remain > 0)
        return `${remain}d`;
    remain = Math.floor(time / 3600000);
    if (remain > 0)
        return `${remain}h`;
    remain = Math.floor(time / 60000);
    if (remain > 0)
        return `${remain}m`;
    return "1m";
}
function mwDBErrAlert(event) {
    alert(`Database Error: ${event.message}.`);
}
function mwOpenDatabase() {
    let request = indexedDB.open("MemWord", 1);
    request.onerror = mwDBErrAlert;
    let key = { keyPath: "word" };
    request.onupgradeneeded = (event) => {
        mw.db = event.target.result;
        mw.db.onerror = mwDBErrAlert;
        mw.db.createObjectStore("MDict", key);
        let store = mw.db.createObjectStore("MWord", key);
        store.createIndex("level", "level");
        store.createIndex("last", "last");
        store.createIndex("next", "next");
    };
    request.onsuccess = (event) => {
        mw.db = event.target.result;
        mw.db.onerror = mwDBErrAlert;
    };
}
function mwPlaySound(sound) {
    let x = typeRegex.exec(sound);
    if (x) {
        mwaudio.setAttribute('type', x[1]);
        mwaudio.setAttribute('src', sound);
    }
}
function mwKeyPress(event) {
    switch (event.keyCode) {
        case 66:
        case 98:
        case 67:
        case 99:
            mwSpeakIt();
            break;
        case 32:
            mwShowAnswerClick();
            break;
        case 78:
        case 88:
        case 110:
        case 120:
            mwIKnowItClick();
            break;
        case 77:
        case 90:
        case 109:
        case 122:
            mwDontKnowClick();
            break;
        case 46:
        case 62:
            mwStudyNext();
    }
    event.preventDefault();
}
function mwUpdateStat(stat) {
    let all = $("tr[data-level=all]").children("td");
    all[2].html = `${stat.all[0]}|${stat.all[1]}`;
    all[1].children("div").children("div").css("width", `${stat.all[0]/stat.all[1]}`);
    for (let i = 0; i < 5; i++) {
        let blevel = $(`tr[data-level=blevel${i}]`).children("td");
        blevel[2].html = `${stat.blevels[i][0]}|${stat.blevels[i][1]}`;
        blevel[1].children("div").children("div").css("width", `${stat.blevel[i][0]/stat.blevel[i][1]}`);
    }
    let hard = $("tr[data-level=hard]").children("td");
    hard[2].html = `${stat.hard[0]}|${stat.hard[1]}`;
    hard[1].children("div").children("div").css("width", `${stat.hard[0]/stat.hard[1]}`);
    for (let i = 0; i < 5; i++) {
        let star = $(`tr[data-level=star${i}]`).children("td");
        star[2].html = `${stat.stars[i][0]}|${stat.stars[i][1]}`;
        star[1].children("div").children("div").css("width", `${stat.stars[i][0]/stat.stars[i][1]}`);
    }
}
function mwReStat() {
    let stat = new MWStat();
    let transaction = mwdb.transaction(["MWord", "MDict"]);
    transaction.oncomplete = (ev) => {mwUpdateStat(stat);};
    let ctime = new Date().getTime();
    let dict_store = transaction.objectStore("MDict");
    transaction.objectStore("MWord").openCursor().onsuccess = (ev) => {
        let cursor = ev.target.result;
        if (cursor) {
            let mword = cursor.value;
            let blevel = mwGetBLevel(mword.level);
            dict_store.get(mword.word).onsuccess = (e) => {
                let star = e.target.result.star;
                intask = ctime >= mword.next;
                stat.all[1] += 1;
                stat.blevels[blevel][1] += 1;
                stat.stars[star][1] += 1;
                if (intask) {
                    stat.all[0] += 1;
                    stat.blevels[blevel][0] += 1;
                    stat.stars[star][0] += 1;
                }
                if (mword.hard > 0) {
                    stat.hard[1] += 1;
                    if (intask) stat.hard[0] += 1;
                }
                cursor.continue();
            };
        } else mwUpdateStat(stat);
    };
}
function mwImport() {
    let words = $("#mw_text_port").val().split("\n");
    let index = 0;
    let exec = (item) => {

    };
}
var mw = {
    db: null,
    audio: document.createElement('audio'),
    option: new MOption(),
    pattern: /^({.+})$/,
    typeRegex: /^data:(\w+\/\w+);base64,/,
};
$(document).ready(() => {
    mw.audio.autoplay = true;
    $(this).on('unload', () => {
        if (mw.db) mw.db.close();
    });
    $('#mwStudy').keypress(mwKeyPress);
    $('#mwReadIt').click(mwaudio.play);
    mwOpenDatabase();
});
