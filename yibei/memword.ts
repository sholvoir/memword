/*
 * Author： Sovar He
 */
class MW {
  props: Object;
  stat: MWStat;
  colors: string[];
  levels: number[];
  autoRead: boolean;
  cblevel: number;
  npergrp: number;
  episode: string[];
  cword: string;
  nextTimes: number[];
  remainder: number;
  blevelBanner1s: HTMLElement[];
  blevelBanner2s: HTMLElement[];
  blevelNumbers: HTMLElement[];
  blevelButtons: HTMLElement[];
  autoReadDiv :HTMLElement;
  promptText: HTMLElement;
  wordText: HTMLElement;
  imexportText: HTMLTextAreaElement;
  transText: HTMLTextAreaElement;
  timeText: HTMLElement;
  remainderText: HTMLElement;
  divHome: HTMLDivElement;
  divStudy: HTMLDivElement;
  dialog: HTMLDivElement;
  cancelButton: HTMLElement;
  importOkButton: HTMLElement;
  exportOkButton: HTMLElement;
  constructor() {
    this.props = {};
    this.cblevel = 0;
    this.autoRead = true;
    this.npergrp = 20;
    this.colors = ["DarkRed", "Blue", "Orange", "Olive", "ForestGreen", "DarkGray"];
    this.levels = [0, 1, 9, 12, 15];
    this.nextTimes = [0, 60000, 300000, 1200000, 3600000, 14400000, 43200000, 86400000,
      259200000, 604800000, 1468800000, 3542400000, 7689600000, 15465600000, 31708800000, 315360000000];
  }
}

var responsiveVoice: any;
const mw = new MW();

class MWTime {
  day: number;
  hour: number;
  minute: number;
  constructor(ms: number) {
    this.day = Math.floor(ms / 86400000);
    let remain = ms % 86400000;
    this.hour = Math.floor(remain / 3600000);
    remain %= 3600000;
    this.minute = Math.floor(remain / 60000);
  }
  toString() {
    if (this.day > 0) return 1 === this.day ? `1 day` : `${this.day} days`;
    if (this.hour > 0) return 1 === this.hour ? `1 hour` : `${this.hour} hours`;
    if (this.minute > 0) return 1 === this.minute ? `1 minute` : `${this.minute} minites`;
    return `Less than 1 minute`;
  }
}

class MWProp {
  level: number;
  hard: number;
  last: number;
  next: number;
  constructor(level: number, hard: number, last: number, next: number) {
    this.level = level;
    this.hard = hard;
    this.last = last;
    this.next = next;
  }
  getBLevel() {
    if (0 >= this.level) return 0;
    if (8 >= this.level) return 1;
    if (11 >= this.level) return 2;
    if (14 >= this.level) return 3;
    return 4;
  }
  toString() {
    return `${this.level},${this.hard},${this.last},${this.next}`;
  }
}

class MWStat {
  task: number[];
  total: number[];
  constructor(total: number[], task: number[]) {
    let b = 0;
    let t = 0;
    for (let i in total) {
      t += task[i]
      b += total[i];
    }
    total.push(b);
    task.push(t);
    this.total = total;
    this.task = task;
  }
}

function mwShowPrompt(prompt: string) {
  mw.promptText.innerHTML = prompt;
  setTimeout(mwHidePrompt, 2000);
}

function mwHidePrompt() {
  mw.promptText.innerHTML = "";
}

function mwDefaultProp() {
  let t = new Date().getTime();
  return new MWProp(0, 0, t, t);
}

function mwParse(mwstr: string): MWProp {
  if ("string" !== typeof mwstr) return null;
  let t = mwstr.split(",");
  if (4 !== t.length) return null;
  let l = parseInt(t[0]);
  let h = parseInt(t[1])
  let s = parseInt(t[2]);
  let n = parseInt(t[3]);
  if (isNaN(l) || isNaN(s) || isNaN(n)) return null;
  return new MWProp(l, h, s, n);
}

function mwRead() {
  let total = [0, 0, 0, 0, 0];
  let task = [0, 0, 0, 0, 0];
  let ctime = new Date().getTime();
  for (let word in localStorage) {
    let prop = mwParse(localStorage.getItem(word));
    if (null !== prop) {
      mw.props[word] = prop;
      let blevel = prop.getBLevel();
      total[blevel] += 1;
      if (prop.level < 15 && ctime - prop.next > 0) task[blevel] += 1;
    }
  }
  mw.stat = new MWStat(total, task);
}

function mwRestat() {
  let total = [0, 0, 0, 0, 0];
  let task = [0, 0, 0, 0, 0];
  let ctime = new Date().getTime();
  for (let word in mw.props) {
    let prop = mw.props[word];
    let blevel = prop.getBLevel();
    total[blevel] += 1;
    if (prop.level < 15 && ctime - prop.next > 0) task[blevel] += 1;
  }
  mw.stat = new MWStat(total, task);
}

function mwAddWord(word: string, prop: MWProp): boolean {
  let oprop = mw.props[word];
  if (undefined !== oprop && (null === prop || prop.last < oprop.last)) return false;
  let p = null === prop ? mwDefaultProp(): prop;
  mw.props[word] = p;
  localStorage.setItem(word, p.toString());
  if (null === prop) {
    mw.stat.task[0] ++;
    mw.stat.total[0] ++;
  }
  return true;
}

function mwUpdateLevel(prop: MWProp) {
  let ctime = new Date().getTime();
  prop.last = ctime;
  prop.next = ctime + mw.nextTimes[prop.level];
  localStorage.setItem(mw.cword, prop.toString());
}

function mwUpdateHomeUI() {
  let t = mw.stat.total[5];
  if (0 !== t) {
    for (let i = 0; i < 5; i++) {
      let p = Math.floor(mw.stat.total[i] * 100 / t);
      mw.blevelBanner1s[i].style.width = `${p}%`;
      mw.blevelBanner2s[i].style.width = `${100 - p}%`;
    }
    for (let i = 0; i < 6; i++)
      mw.blevelNumbers[i].innerHTML = `${mw.stat.task[i]}/${mw.stat.total[i]}`;
  }
}

function mwUpdateStudyUI(word: string) {
  let ctime = new Date().getTime();
  mw.cword = word;
  let prop = mw.props[word];
  mw.wordText.innerHTML = word;
  let blevel = prop.getBLevel();
  mw.blevelButtons[mw.cblevel].style.background = mw.colors[5];
  mw.blevelButtons[blevel].style.background = mw.colors[blevel];
  mw.timeText.innerHTML = new MWTime(ctime - prop.last).toString();
  mw.remainderText.innerHTML = (mw.episode.length + 1).toString();
  if (mw.autoRead) responsiveVoice.speak(word);
  mw.cblevel = blevel;
}

function mwStudyNext() {
  if (mw.episode.length > 0) mwUpdateStudyUI(mw.episode.pop());
  else {
    alert("Congratulating! You have pass this episode!");
    mw.divStudy.style.display = "none";
    mw.divHome.style.display = "block";
    mwRestat();
    mwUpdateHomeUI();
  }
}

function mwResize() {
  mw.imexportText.style.width = window.innerWidth - 20 + "px";
  mw.imexportText.style.height = window.innerHeight - 50 + "px";
}

function mwKeyPress(e) {
  switch (e.keyCode) {
  case 32:
    mwShowAnswerClick();
    break;
  case 78:
  case 90:
  case 110:
  case 122:
    mwIKnowItClick();
    break;
  case 77:
  case 88:
  case 109:
  case 120:
    mwDontKnowClick();
    break;
  case 46:
    mwIgnoreItClick();
  }
}

function mwImportClick() {
  mw.imexportText.value = "";
  mw.cancelButton.style.display = "block";
  mw.importOkButton.style.display = "block";
  mw.exportOkButton.style.display = "none";
  mw.dialog.style.display = "block";
}

function mwExportClick() {
  let t = "";
  for (let word in mw.props) t += `${word}:${mw.props[word].toString()}\n`;
  mw.imexportText.value = t;
  mw.cancelButton.style.display = "none";
  mw.importOkButton.style.display = "none";
  mw.exportOkButton.style.display = "block";
  mw.dialog.style.display = "block";
}

function mwImportOkButtonClick() {
  let s = 0;
  let f = 0;
  let t = mw.imexportText.value.split("\n");
  for (let i in t) {
    let p = t[i].split(":");
    if (p.length > 0 && mwAddWord(p[0], mwParse(p[1]))) s += 1; else f += 1;
  }
  mwRestat();
  mw.dialog.style.display = "none";
  mwShowPrompt(`Import success ${s}, failture ${f}.`);
  mwUpdateHomeUI();
}

function mwAddWordClick() {
  let prompt = mwAddWord(mw.transText.value, null) ? "Add Success!" : "Add Failture: The word had already been in.";
  mwShowPrompt(prompt);
  mwUpdateHomeUI();
}

function mwCancelButtonClick() {
  mw.dialog.style.display = "none";
}

function mwStudyClick(blevel: number) {
  let episode: string[] = [];
  let ctime = new Date().getTime();
  let mini = "0";
  let minv = 0;
  function getmin() {
    for (let i in episode) {
      let v = mw.props[episode[i]].next;
      if (v < minv) { mini = i; minv = v; }
    }
  }
  for (let word in mw.props) {
    let prop = mw.props[word];
    if (((5 === blevel && prop.level < 4) || blevel === prop.getBLevel()) && prop.next < ctime) {
      if (episode.length < mw.npergrp) {
        episode.push(word);
        if (episode.length == mw.npergrp) getmin();
      } else if (prop.next > minv) {
        episode[mini] = word;
        getmin();
      }
    }
  }
  mw.episode = episode;
  mw.divHome.style.display = "none";
  mw.divStudy.style.display = "block";
  mwStudyNext();
}

function mwBLevelClick(blevel: number) {
  if (blevel === mw.cblevel) return;
  let prop = mw.props[mw.cword];
  prop.level = mw.levels[blevel];
  mwUpdateLevel(prop);
  mwStudyNext();
}

function mwDeleteButtonClick() {
  delete mw.props[mw.cword];
  delete localStorage[mw.cword];
  mwStudyNext();
}

function mwShowAnswerClick() {
  mw.transText.value = mw.cword;
}

function mwIKnowItClick() {
  let prop = mw.props[mw.cword];
  if (prop.hard > 0) prop.hard --;
  else prop.level += 1;
  mwUpdateLevel(prop);
  mwStudyNext();
}
function mwDontKnowClick() {
  let prop = mw.props[mw.cword];
  if (prop.level > 7 && 0 === prop.hard) prop.level -= 1;
  for (; prop.hard < 4; prop.hard++)
    mw.episode.splice(Math.floor(Math.random() * mw.episode.length), 0, mw.cword);
  mwUpdateLevel(prop);
  mwStudyNext();
}

function mwIgnoreItClick() {
  mwStudyNext();
}

function mwAutoReadButtonClick() {
  mw.autoRead = ! mw.autoRead;
  mw.autoReadDiv.innerHTML = `Auto Read: ${mw.autoRead ? "ON" : "OFF"}`;
}

function mwInsertInterface() {
  document.body.addEventListener("keypress", mwKeyPress);
  window.addEventListener("resize", mwResize, true);

  let mwCss = document.createElement('link');
  mwCss.rel = "stylesheet";
  mwCss.href = "https://micit.ddns.net/css/memword.css";
  document.head.appendChild(mwCss);

  mw.transText = document.forms["text_form"]["text"];
  let gb = document.getElementById('gt-c');

  let mwDivHome = document.createElement('div');
  mwDivHome.classList.add("mw-wrap");
  document.body.insertBefore(mwDivHome, gb);
  mwDivHome.innerHTML = `
  <div class="flex-container-around mw-row-1">
    <div>
      <div class="flex-container-fix mw-row-2-1">
        <div class="mw-text20" id="mw_prompt"></div>
      </div>
      <div class="flex-container-around mw-row-2-2">
        <div class="mw-button" onclick="mwImportClick();">Import</div>
        <div class="mw-button" onclick="mwExportClick();">Export</div>
        <div class="mw-button" onclick="mwAddWordClick();">Add</div>
        <div class="mw-button" onclick="mwStudyClick(5);">Study</div>
      </div>
    </div>
    <div class="flex-container-around left-border">
      <div class="mw-score-text">
        <div class="mw-row-3">All</div>
        <div class="mw-row-3">Finished</div>
        <div class="mw-row-3">Familiar</div>
      </div>
      <div style="flex:4;">
        <div class="mw-row-3 flex-container-fix mw-banner" onclick="mwStudyClick(5);">
          <div class="mw-banner1" style="width:100%;background:Grey;"></div>
        </div>
        <div class="mw-row-3 flex-container-fix mw-banner" onclick="mwStudyClick(4);">
          <div id="mw_finish_banner1" class="mw-banner1" style="width:0%;background:ForestGreen;"></div>
          <div id="mw_finish_banner2" class="mw-banner2" style="width:100%"></div>
        </div>
        <div class="mw-row-3 flex-container-fix mw-banner" onclick="mwStudyClick(3);">
          <div id="mw_familiar_banner1" class="mw-banner1" style="width:0%;background:Olive;"></div>
          <div id="mw_familiar_banner2" class="mw-banner2" style="width:100%"></div>
        </div>
      </div>
      <div class="mw-score-number">
        <div id="mw_all_number" class="mw-row-3">0/0</div>
        <div id="mw_finish_number" class="mw-row-3">0/0</div>
        <div id="mw_familiar_number" class="mw-row-3">0/0</div>
      </div>
    </div>
    <div class="flex-container-around left-border">
      <div class="mw-score-text">
        <div class="mw-row-3">Medium</div>
        <div class="mw-row-3">Start</div>
        <div class="mw-row-3">Never</div>
      </div>
      <div style="flex:4;">
        <div class="mw-row-3 flex-container-fix mw-banner" onclick="mwStudyClick(2);">
          <div id="mw_medium_banner1" class="mw-banner1" style="width:0%;background:Orange;"></div>
          <div id="mw_medium_banner2" class="mw-banner2" style="width:100%"></div>
        </div>
        <div class="mw-row-3 flex-container-fix mw-banner" onclick="mwStudyClick(1);">
          <div id="mw_start_banner1" class="mw-banner1" style="width:0%;background:Blue;"></div>
          <div id="mw_start_banner2" class="mw-banner2" style="width:100%"></div>
        </div>
        <div class="mw-row-3 flex-container-fix mw-banner" onclick="mwStudyClick(0);">
          <div id="mw_never_banner1" class="mw-banner1" style="width:0%;background:DarkRed;"></div>
          <div id="mw_never_banner2" class="mw-banner2" style="width:100%"></div>
        </div>
      </div>
      <div class="mw-score-number">
        <div id="mw_medium_number" class="mw-row-3">0/0</div>
        <div id="mw_start_number" class="mw-row-3">0/0</div>
        <div id="mw_never_number" class="mw-row-3">0/0</div>
      </div>
    </div>
  </div>
  `;
  mw.divHome = mwDivHome;

  let mwDivStudy = document.createElement('div');
  mwDivStudy.classList.add("mw-wrap");
  mwDivStudy.style.display = "none";
  mwDivStudy.innerHTML = `
  <div class="flex-container-fix mw-row-2-1">
    <div id="mw_never_button" class="mw-button" onclick="mwBLevelClick(0);">Never</div>
    <div id="mw_start_button" class="mw-button" onclick="mwBLevelClick(1);">Start</div>
    <div id="mw_medium_button" class="mw-button" onclick="mwBLevelClick(2);">Medium</div>
    <div id="mw_familiar_button" class="mw-button" onclick="mwBLevelClick(3);">Familiar</div>
    <div id="mw_finish_button" class="mw-button" onclick="mwBLevelClick(4);">Finished</div>
    <div id="mw_time" class="mw-text20">30 days</div>
    <div id="mw_remainder" class="mw-text20 mw-shove-right" class="mw-text20">0</div>
    <div class="mw-button" onclick="mwDeleteButtonClick();">Delete</div>
    <div id="mw_auto_read_button" class="mw-button" style="width:140px;" onclick="mwAutoReadButtonClick();">Auto Read: ON</div>
  </div>
  <div class="flex-container-around mw-row-2-2">
    <div id="mw_text_word"></div>
    <div class="mw-button" onclick="mwShowAnswerClick();" title="Hot key: Space"><strong>☺</strong> Show</div>
    <div class="mw-button" onclick="mwIKnowItClick();" title="Hot key: Z/N" style="background:OliveDrab;"><strong>√</strong> Known</div>
    <div class="mw-button" onclick="mwDontKnowClick();" title="Hot key: X/M" style="background:Peru;"><strong>ⅹ</strong> Don't</div>
    <div class="mw-button" onclick="mwIgnoreItClick();" title="Hot key: ."><strong>⇗</strong> Ignore</div>
  </div>
  `;
  document.body.insertBefore(mwDivStudy, gb);
  mw.divStudy = mwDivStudy;

  let mwDialog = document.createElement('div');
  mwDialog.id = "mw_dialog";
  mwDialog.innerHTML = `
  <textarea id="mw_text_port" name="mw_text_port" style=""></textarea>
  <div id="mw_cancel_button" class="mw-button" style="right:90px;" onclick="mwCancelButtonClick();">Cancel</div>
  <div id="mw_import_ok_button" class="mw-button" style="right:10px;" onclick="mwImportOkButtonClick();">OK</div>
  <div id="mw_export_ok_button" class="mw-button" style="right:10px;" onclick="mwCancelButtonClick();">OK</div>
  `;
  document.body.insertBefore(mwDialog, gb);
  mw.dialog = mwDialog;

  mw.blevelBanner1s = [
    document.getElementById("mw_never_banner1"),
    document.getElementById("mw_start_banner1"),
    document.getElementById("mw_medium_banner1"),
    document.getElementById("mw_familiar_banner1"),
    document.getElementById("mw_finish_banner1")
  ];
  mw.blevelBanner2s = [
    document.getElementById("mw_never_banner2"),
    document.getElementById("mw_start_banner2"),
    document.getElementById("mw_medium_banner2"),
    document.getElementById("mw_familiar_banner2"),
    document.getElementById("mw_finish_banner2")
  ];
  mw.blevelNumbers = [
    document.getElementById("mw_never_number"),
    document.getElementById("mw_start_number"),
    document.getElementById("mw_medium_number"),
    document.getElementById("mw_familiar_number"),
    document.getElementById("mw_finish_number"),
    document.getElementById("mw_all_number")
  ];
  mw.blevelButtons = [
    document.getElementById("mw_never_button"),
    document.getElementById("mw_start_button"),
    document.getElementById("mw_medium_button"),
    document.getElementById("mw_familiar_button"),
    document.getElementById("mw_finish_button")
  ];
  mw.promptText = document.getElementById("mw_prompt");
  mw.timeText = document.getElementById("mw_time");
  mw.wordText = document.getElementById("mw_text_word");
  mw.remainderText = document.getElementById("mw_remainder");
  mw.autoReadDiv = document.getElementById("mw_auto_read_button");
  mw.imexportText = document.getElementById("mw_text_port") as HTMLTextAreaElement;
  mw.cancelButton = document.getElementById("mw_cancel_button");
  mw.importOkButton = document.getElementById("mw_import_ok_button");
  mw.exportOkButton = document.getElementById("mw_export_ok_button");
}

function mwInit() {
  mwInsertInterface();
  mwRead();
  mwUpdateHomeUI();
  mwResize();
  setTimeout(function() {responsiveVoice.speak("Welcome to Sovar's word study!"); }, 1000);
}

mwInit();
