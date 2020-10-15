export class MWWord {
    constructor(word, level, hard, last, next, star, answer, sound) {
        this.word = word;
        this.level = level;
        this.hard = hard;
        this.last = last;
        this.next = next;
        this.star = star;
        this.answer = answer;
        this.sound = sound;
    }
}
class MWAlert extends MWType {
    constructor(content) {
        super("MWAlert");
        this.content = content;
    }
}
class MWStat extends MWType {
    constructor() {
        super("MWStat");
        this.total = [0, 0, 0, 0, 0, 0, 0];
        this.task = [0, 0, 0, 0, 0, 0, 0];
    }
}
class MWGetEpisode extends MWType {
    constructor(levelmin, levelmax, hardmin, hardmax) {
        super("MWGetEpisode");
        this.top = 20;
        this.levelmin = levelmin;
        this.levelmax = levelmax;
        this.hardmin = hardmin;
        this.hardmax = hardmax;
    }
}
class MWEpisode extends MWType {
    constructor(words) {
        super("MWEpisode");
        this.words = words;
    }
}
class MWAddWord extends MWType {
    constructor(mword) {
        super("MWAddWord");
        this.mword = mword;
    }
}
class MWDeleteWord extends MWType {
    constructor(mword) {
        super("MWDeleteWord");
        this.mword = mword;
    }
}
class MWUpdateWord extends MWType {
    constructor(mword) {
        super("MWUpdateWord");
        this.mword = mword;
    }
}
class MWSearch extends MWType {
    constructor() {
        super("MWSearch");
        this.wordpatten = "";
        this.levelmin = 0;
        this.levelmax = 100;
        this.hardmin = 0;
        this.hardmax = 100;
        this.lastmin = 0;
        this.lastmax = 33008792205635;
        this.nextmin = 0;
        this.nextmax = 33008792205635;
    }
}
class MWSearchResult extends MWType {
    constructor(result) {
        super("MWSearchResult");
        this.result = result;
    }
}
class MWBatchResult extends MWType {
    constructor(type, success, failure) {
        super(type);
        this.success = success;
        this.failure = failure;
    }
}
class MWImport extends MWType {
    constructor(source) {
        super("MWImport");
        this.source = source;
    }
}
class MWDeleteBatch extends MWType {
    constructor(source) {
        super("MWDeleteBatch");
        this.source = source;
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
    return new MWWord(word, 0, 0, t, t);
}
var mwpattern1 = /^([\w ]+),(\d+),(\d+),(\d+),(\d+)$/;
var mwpattern2 = /^([\w ]+)->({.+})$/;
var mwpattern3 = /^({.+})$/;
function MWWordParse(mwordstr) {
    if ("string" !== typeof mwordstr)
        return null;
    let x = mwpattern3.exec(mwordstr);
    if (null !== x)
        return JSON.parse(mwordstr);
    x = mwpattern2.exec(mwordstr);
    if (null !== x) {
        let p = JSON.parse(x[2]);
        p.word = x[1];
        return p;
    }
    x = mwpattern1.exec(mwordstr);
    if (null !== x)
        return new MWWord(x[1], parseInt(x[2]), parseInt(x[3]), parseInt(x[4]), parseInt(x[5]));
    else
        return mwDefaultWord(mwordstr);
}
