/*
 * Author： Sovar He
 * Level: 0 ~ 15
 * Blevel: 0 ~ 4  5 mean all blevel
 * Hard: 0 ~ 4  5 mean all hard
*/

export interface MWType {
  type: string;
}

export class MWWord {
  word: string;
  level: number;
  hard: number;
  last: number;
  next: number;
  star: number;
  answer: string;
  sound: string;
  constructor(word: string, level: number, hard: number, last: number, next: number, star: number, answer: string, sound: string) {
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
  content: string;
  constructor(content: string) {
    super("MWAlert");
    this.content = content;
  }
}

class MWStat extends MWType {
  total: number[];
  task: number[];
  constructor() {
    super("MWStat");
    this.total = [0,0,0,0,0,0,0];
    this.task = [0,0,0,0,0,0,0];
  }
}

class MWGetEpisode extends MWType {
  top: number;
  levelmin: number;
  levelmax: number;
  hardmin: number;
  hardmax: number;
  constructor(levelmin: number, levelmax: number, hardmin: number, hardmax: number) {
    super("MWGetEpisode");
    this.top = 20;
    this.levelmin = levelmin;
    this.levelmax = levelmax;
    this.hardmin = hardmin;
    this.hardmax = hardmax;
  }
}

class MWEpisode extends MWType {
  words: MWWord[];
  constructor(words: MWWord[]) {
    super("MWEpisode");
    this.words = words;
  }
}

class MWAddWord extends MWType {
  mword: MWWord;
  constructor(mword: MWWord) {
    super("MWAddWord");
    this.mword = mword;
  }
}

class MWDeleteWord extends MWType {
  mword: MWWord;
  constructor(mword: MWWord) {
    super("MWDeleteWord");
    this.mword = mword;
  }
}

class MWUpdateWord extends MWType {
  mword: MWWord;
  constructor(mword: MWWord) {
    super("MWUpdateWord");
    this.mword = mword;
  }
}

class MWSearch extends MWType {
  wordpatten: string;
  levelmin: number;
  levelmax: number;
  hardmin: number;
  hardmax: number;
  lastmin: number;
  lastmax: number;
  nextmin: number;
  nextmax: number;
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
  result: string;
  constructor(result: string) {
    super("MWSearchResult");
    this.result = result;
  }
}

class MWBatchResult extends MWType {
  success: number;
  failure: number;
  constructor(type: string, success: number, failure: number) {
    super(type);
    this.success = success;
    this.failure = failure;
  }
}

class MWImport extends MWType {
  source: string;
  constructor(source: string) {
    super("MWImport");
    this.source = source;
  }
}

class MWDeleteBatch extends MWType {
  source: string;
  constructor(source: string) {
    super("MWDeleteBatch");
    this.source = source;
  }
}

function mwGetBLevel(level: number) {
  if (0 >= level) return 0;
  if (6 >= level) return 1;
  if (10 >= level) return 2;
  if (13 >= level) return 3;
  return 4;
}

function mwDefaultWord(word: string) {
  let t = new Date().getTime();
  return new MWWord(word, 0, 0, t, t);
}

var mwpattern1 = /^([\w ]+),(\d+),(\d+),(\d+),(\d+)$/;
var mwpattern2 = /^([\w ]+)->({.+})$/;
var mwpattern3 = /^({.+})$/;

function MWWordParse(mwordstr: string): MWWord {
  if ("string" !== typeof mwordstr) return null;
  let x = mwpattern3.exec(mwordstr);
  if (null !== x) return JSON.parse(mwordstr);
  x = mwpattern2.exec(mwordstr);
  if (null !== x) {
    let p = JSON.parse(x[2]);
    p.word = x[1];
    return p;
  }
  x = mwpattern1.exec(mwordstr);
  if (null !== x) return new MWWord(x[1], parseInt(x[2]), parseInt(x[3]), parseInt(x[4]), parseInt(x[5]));
  else return mwDefaultWord(mwordstr);
}
