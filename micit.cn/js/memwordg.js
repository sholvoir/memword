class MWWord {
    constructor(word, level, hard, last, next) {
        this.word = word;
        this.level = level;
        this.hard = hard;
        this.last = last;
        this.next = next;
    }
}
class MWType {
    constructor(type) {
        this.type = type;
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
class MWFlatG {
    constructor() {
        this.prompts = ["", "", ""];
        this.promptc = 0;
        this.transText = document.forms["text_form"]["text"];
        this.listenElem = document.getElementById("gt-src-listen");
        this.translateButton = document.getElementById("gt-submit");
        this.mouseDownEvent = document.createEvent('MouseEvents');
        this.mouseDownEvent.initEvent('mousedown', true, true);
        this.mouseUpEvent = document.createEvent('MouseEvents');
        this.mouseUpEvent.initEvent('mouseup', true, true);
    }
}
function mwTranslationIt(word) {
    mwp.transText.value = word + "\n";
    setTimeout(mwTranslationIt0, 100);
}
function mwTranslationIt0() {
    mwp.translateButton.click();
}
function mwSpeakIt() {
    setTimeout(mwSpeakIt1, 800);
}
function mwSpeakIt1() {
    mwp.listenElem.dispatchEvent(mwp.mouseDownEvent);
    setTimeout(mwSpeakItO, 100);
}
function mwSpeakItO() {
    mwp.listenElem.dispatchEvent(mwp.mouseUpEvent);
    mwf.studyDiv.focus();
}
function mwFlatInit() {
    let mwfss = document.createElement('link');
    mwfss.rel = "stylesheet";
    mwfss.href = "https://micit.cn/css/memword-g.css";
    document.head.appendChild(mwfss);
}
function mwResize() {
    let headerLeft = window.innerWidth > 1029 ? "150px" : "28px";
    mwf.homeDiv.style.left = headerLeft;
    mwf.studyDiv.style.left = headerLeft;
    let headerWidth = window.innerWidth > 1029 ? window.innerWidth - 320 + "px" : window.innerWidth - 56 + "px";
    mwf.homeDiv.style.width = headerWidth;
    mwf.studyDiv.style.width = headerWidth;
    let articleHeight = window.innerHeight - 109 + "px";
    mwf.dialogDiv.style.height = articleHeight;
    mwf.answerDiv.style.height = articleHeight;
    mwf.searchInput.style.width = window.innerWidth - 80 * 4 - 220 + "px";
    mwf.imexportText.style.width = window.innerWidth - 20 + "px";
    mwf.imexportText.style.height = window.innerHeight - 150 + "px";
}
function mwShowPrompt(prompt) {
    mwp.promptc += 1;
    mwp.prompts.push(`${mwp.promptc}. ${prompt}`);
    while (mwp.prompts.length > 4)
        mwp.prompts.shift();
    mwf.promptDiv.innerHTML = `${mwp.prompts[0]} &nbsp; ${mwp.prompts[1]}<br>${mwp.prompts[2]} &nbsp; ${mwp.prompts[3]}`;
}
var mwp = new MWFlatG();
class MWCore {
    constructor() {
        this.levels = [0, 1, 7, 11, 14];
        this.episode = [];
        this.episodeInsert = [1, 4, 9];
        this.episodeInsertTimes = [3, 3, 3, 2, 1];
        this.nextTimes = [0, 60000, 300000, 1800000, 5400000, 21600000, 86400000,
            151200000, 259200000, 604800000, 1123200000, 2160000000, 4233600000,
            8380800000, 16502400000, 31708800000];
        this.stat = new MWStat();
    }
}
class MWFace {
    constructor() {
        this.cwordClass = "mw-text-word1";
        this.colors = ["DarkRed", "Blue", "Orange", "Olive", "ForestGreen", "DarkGray"];
    }
}
function mwSendToService(msg) {
    mwd.postMessage(JSON.stringify(msg), "*");
}
function mwforeInit() {
    mwf.homeDiv = document.getElementById("mw_home");
    mwf.studyDiv = document.getElementById("mw_study");
    mwf.dialogDiv = document.getElementById("mw_dialog");
    mwf.answerDiv = document.getElementById("mw_answer");
    mwf.promptDiv = document.getElementById("mw_prompt");
    mwf.blevelBanners = [
        document.getElementById("mw_never_banner"),
        document.getElementById("mw_start_banner"),
        document.getElementById("mw_medium_banner"),
        document.getElementById("mw_familiar_banner"),
        document.getElementById("mw_finish_banner"),
        document.getElementById("mw_hard_banner")
    ];
    mwf.blevelNumbers = [
        document.getElementById("mw_never_number"),
        document.getElementById("mw_start_number"),
        document.getElementById("mw_medium_number"),
        document.getElementById("mw_familiar_number"),
        document.getElementById("mw_finish_number"),
        document.getElementById("mw_hard_number"),
        document.getElementById("mw_all_number")
    ];
    mwf.searchInput = document.getElementById("mw_search_input");
    mwf.imexportText = document.getElementById("mw_imexport_text");
    mwf.levelText1 = document.getElementById("mw_level1");
    mwf.levelText2 = document.getElementById("mw_level2");
    mwf.inTaskCheck = document.getElementById("mw_in_task");
    mwf.blevelSelect = document.getElementById("mw_blevel_select");
    mwf.timeText = document.getElementById("mw_time_div");
    mwf.remainderText = document.getElementById("mw_remainder");
    mwf.wordText = document.getElementById("mw_word_text");
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
function mwStatSub(mword, ctime) {
    let blevel = mwGetBLevel(mword.level);
    mwc.stat.total[blevel] -= 1;
    mwc.stat.total[6] -= 1;
    if (ctime >= mword.next) {
        mwc.stat.task[blevel] -= 1;
        mwc.stat.task[6] -= 1;
    }
    if (mword.hard > 0) {
        mwc.stat.total[5] -= 1;
        if (ctime >= mword.next)
            mwc.stat.task[5] -= 1;
    }
}
function mwStatAdd(mword, ctime) {
    let blevel = mwGetBLevel(mword.level);
    mwc.stat.total[blevel] += 1;
    mwc.stat.total[6] += 1;
    if (ctime >= mword.next) {
        mwc.stat.task[blevel] += 1;
        mwc.stat.task[6] += 1;
    }
    if (mword.hard > 0) {
        mwc.stat.total[5] += 1;
        if (ctime >= mword.next)
            mwc.stat.task[5] += 1;
    }
}
function mwUpdateLevel(mword) {
    if (mword.level > 15)
        mwSendToService(new MWDeleteWord(mword));
    else {
        let ctime = new Date().getTime();
        mword.last = ctime;
        if (mword.hard > 0)
            mword.next = ctime;
        else
            mword.next = ctime + mwc.nextTimes[mword.level];
        mwSendToService(new MWUpdateWord(mword));
    }
    mwStudyNext();
}
function mwShowStudy() {
    mwf.homeDiv.style.display = "none";
    mwf.studyDiv.style.display = "flex";
    mwf.studyDiv.focus();
}
function mwShowHome() {
    mwf.studyDiv.style.display = "none";
    mwf.answerDiv.style.display = "none";
    mwf.homeDiv.style.display = "flex";
}
function mwUpdateHomeUI() {
    let t = mwc.stat.total[6];
    if (0 !== t) {
        for (let i = 0; i < 6; i++)
            mwf.blevelBanners[i].style.width = `${Math.floor(mwc.stat.total[i] * 100 / t)}%`;
        for (let i = 0; i < 7; i++)
            mwf.blevelNumbers[i].innerHTML = `${mwc.stat.task[i]}|${mwc.stat.total[i]}`;
    }
}
function mwShowEditorClick() {
    mwf.dialogDiv.style.display = "block";
}
function mwAddWordClick() {
    let word = mwp.transText.value.split("\n")[0].trim();
    if (word.length > 0)
        mwSendToService(new MWAddWord(mwDefaultWord(word)));
}
function mwChangeWordClassTo(cls) {
    if (mwf.cwordClass !== cls) {
        mwf.wordText.classList.remove(mwf.cwordClass);
        mwf.cwordClass = cls;
        mwf.wordText.classList.add(mwf.cwordClass);
    }
}
function mwUpdateStudyUI() {
    let ctime = new Date().getTime();
    mwf.wordText.innerHTML = "";
    mwf.cblevel = mwGetBLevel(mwf.cword.level);
    mwf.blevelSelect.value = mwf.cblevel.toString();
    mwf.timeText.innerHTML = `${mwf.cword.level}-${mwf.cword.hard}-${mwTimeToString(ctime - mwf.cword.last)}-${mwc.episode.length + 1}`;
    mwf.answerDiv.style.display = "block";
    mwTranslationIt(mwf.cword.word);
    mwSpeakIt();
}
function mwStudyNext() {
    if (mwc.episode.length > 0) {
        mwf.cword = mwc.episode.pop();
        mwUpdateStudyUI();
    }
    else {
        alert("Congratulating! You have pass this episode!");
        mwShowHome();
        mwSendToService(new MWType("MWGetStat"));
    }
}
function mwShowAnswerClick() {
    if (mwf.wordText.innerHTML === "") {
        mwf.wordText.innerHTML = mwf.cword.word;
        if (mwf.cword.word.length > 30)
            mwChangeWordClassTo("mw-text-word3");
        else if (mwf.cword.word.length > 15)
            mwChangeWordClassTo("mw-text-word2");
        else
            mwChangeWordClassTo("mw-text-word1");
    }
    else
        mwf.answerDiv.style.display = "none";
}
function mwIKnowItClick() {
    if (mwf.cword.hard > 0)
        mwf.cword.hard--;
    else
        mwf.cword.level += 1;
    mwUpdateLevel(mwf.cword);
}
function mwDontKnowClick() {
    if (mwf.cword.level === 0)
        mwf.cword.level = 1;
    else if (0 >= mwf.cword.hard && mwf.cblevel > 1)
        mwf.cword.level -= (mwf.cblevel - 1);
    let times = mwc.episodeInsertTimes[mwf.cword.hard];
    mwf.cword.hard = 4;
    for (let i = 0; i < times; i++) {
        let index = mwc.episode.length - mwc.episodeInsert[i];
        if (index >= 0)
            mwc.episode.splice(index, 0, mwf.cword);
    }
    mwUpdateLevel(mwf.cword);
}
function mwDeleteButtonClick() {
    mwSendToService(new MWDeleteWord(mwf.cword));
    mwStudyNext();
}
function mwBLevelChange() {
    let blevel = parseInt(mwf.blevelSelect.value);
    if (blevel === mwf.cblevel)
        return;
    mwf.cword.level = mwc.levels[blevel];
    mwUpdateLevel(mwf.cword);
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
function mwCancelButtonClick() {
    mwSendToService(new MWType("MWGetStat"));
    mwf.dialogDiv.style.display = "none";
}
function mwSearchButtonClick() {
    let search = new MWSearch();
    search.wordpatten = mwf.searchInput.value;
    let level1 = parseInt(mwf.levelText1.value);
    if (!isNaN(level1))
        search.levelmin = level1;
    let level2 = parseInt(mwf.levelText2.value);
    if (!isNaN(level2))
        search.levelmax = level2;
    if (mwf.inTaskCheck.checked)
        search.nextmax = new Date().getTime();
    mwSendToService(search);
}
function mwImportButtonClick() {
    mwSendToService(new MWImport(mwf.imexportText.value));
}
function mwDeleteBatchButtonClick() {
    if (true === confirm("Do you really want to delete these words?"))
        mwSendToService(new MWDeleteBatch(mwf.imexportText.value));
}
function mwInsertInterface() {
    window.addEventListener("resize", mwResize, true);
    let mwDiv = document.createElement('div');
    mwDiv.classList.add("mw-wrap");
    mwDiv.innerHTML = `
  <div id="mw_home" class="mw-header flex-container">
    <div>
      <div class="flex-container mw-row-2">
        <div class="mw-score-text mw-text">Allwords</div>
        <div class="mw-banner" style="flex:4;margin:5px 0;background:Grey;" onclick='mwSendToService(new MWGetEpisode(4, 100, 0, 100));'></div>
        <div id="mw_all_number" class="mw-score-number mw-text">0|0</div>
      </div>
      <div class="flex-container mw-row-2">
        <button onclick="mwShowEditorClick();" style="flex:2">Import/Export</button>
        <button onclick="mwAddWordClick();">Add</button>
        <button onclick='mwSendToService(new MWGetEpisode(0, 100, 0, 100));'>Study</button>
      </div>
    </div>
    <div class="flex-container left-border">
      <div class="mw-score-text">
        <div class="mw-row-3">Finished</div>
        <div class="mw-row-3">Familiar</div>
        <div class="mw-row-3">Medium</div>
      </div>
      <div style="flex:4;">
        <div class="mw-banner" onclick='mwSendToService(new MWGetEpisode(14, 100, 0, 100));'>
          <div id="mw_finish_banner" style="width:0%;background:ForestGreen;"></div>
        </div>
        <div class="mw-banner" onclick='mwSendToService(new MWGetEpisode(11, 13, 0, 100));'>
          <div id="mw_familiar_banner" style="width:0%;background:Olive;"></div>
        </div>
        <div class="mw-banner" onclick='mwSendToService(new MWGetEpisode(7, 10, 0, 100));'>
          <div id="mw_medium_banner" style="width:0%;background:Orange;"></div>
        </div>
      </div>
      <div class="mw-score-number">
        <div id="mw_finish_number" class="mw-row-3">0|0</div>
        <div id="mw_familiar_number" class="mw-row-3">0|0</div>
        <div id="mw_medium_number" class="mw-row-3">0|0</div>
      </div>
    </div>
    <div class="flex-container left-border">
      <div class="mw-score-text">
        <div class="mw-row-3">Start</div>
        <div class="mw-row-3">Hard</div>
        <div class="mw-row-3">Never</div>
      </div>
      <div style="flex:4;">
        <div class="mw-banner" onclick='mwSendToService(new MWGetEpisode(1, 6, 0, 100));'>
          <div id="mw_start_banner" style="width:0%;background:Blue;"></div>
        </div>
        <div class="mw-banner" onclick='mwSendToService(new MWGetEpisode(0, 100, 1, 100));'>
          <div id=mw_hard_banner style="width:0%;background:Grey;"></div>
        </div>
        <div class="mw-banner" onclick='mwSendToService(new MWGetEpisode(0, 0, 0, 100));'>
          <div id="mw_never_banner" style="width:0%;background:DarkRed;"></div>
        </div>
      </div>
      <div class="mw-score-number">
        <div id="mw_start_number" class="mw-row-3">0|0</div>
        <div id="mw_hard_number" class="mw-row-3">0|0</div>
        <div id="mw_never_number" class="mw-row-3">0|0</div>
      </div>
    </div>
  </div>
  <div id="mw_study" class="mw-header flex-container" style="display:none" onkeypress="mwKeyPress(event);" tabindex="0">
    <div id="mw_word_text" class="mw-text-word1"></div>
    <div>
      <div class="flex-container mw-row-2">
        <select id="mw_blevel_select" name="mw_blevel_select" onchange="mwBLevelChange();">
          <option value="0">Never</option>
          <option value="1">Start</option>
          <option value="2">Medium</option>
          <option value="3">Familiar</option>
          <option value="4">Finished</option>
        </select>
        <div id="mw_time_div" class="mw-text" style="flex: 2;"></div>
        <button onclick="mwAddWordClick();">Add</button>
        <button onclick="mwDeleteButtonClick();">Delete</button>

      </div>
      <div class="flex-container mw-row-2">
        <button onclick="mwSpeakIt();" title="Hot Key: B/C"><strong>∈ </strong> Read</button>
        <button onclick="mwShowAnswerClick();" title="Hot key: Space"><strong>☺ </strong> Answer</button>
        <button onclick="mwIKnowItClick();" title="Hot key: X/N" style="background:OliveDrab;"><strong>√ </strong> Known</button>
        <button onclick="mwDontKnowClick();" title="Hot key: Z/M" style="background:Peru;"><strong>ⅹ </strong> Don't</button>
        <button onclick="mwStudyNext();" title="Hot key: ."><strong>⇗</strong> Ignore</button>
      </div>
    </div>
  </div>
  <div id="mw_dialog" class="mw-article">
    <input type="text" style="left: 10px;" name="mw_search_input" id="mw_search_input"/>
    <div style="right:482px;">Level</div>
    <input type="text" style="right:440px;width:40px;" name="mw_level1" id="mw_level1"/>
    <input type="text" style="right:400px;width:40px;" name="mw_level2" id="mw_level2"/>
    <input type="checkbox" style="right:376px;top:14px" name="mw_in_task" id="mw_in_task"/>
    <div style="right:335px">Intask</div>
    <button type="button" style="right:250px;" onclick="mwSearchButtonClick();">Search</button>
    <button type="button" style="right:170px;" onclick="mwImportButtonClick();">Import</button>
    <button type="button" style="right:90px;" onclick="mwDeleteBatchButtonClick();">Delete</button>
    <button type="button" style="right:10px;" onclick="mwCancelButtonClick();">Close</button>
    <textarea id="mw_imexport_text" name="mw_imexport_text"></textarea>
  </div>
  <div id="mw_answer" class="mw-article" style="background:White"></div>
  <div id="mw_prompt" class="mw-footer"></div>
  <iframe id="mw_datasrv" src="https://micit.cn/mword.html" height="0" width="0" style="border:none;"></iframe>
  `;
    document.body.appendChild(mwDiv);
}
function mwInit() {
    window.addEventListener('message', mwMessageDeal);
    console.log("Welcome to Sovar's word study!");
    mwInsertInterface();
    mwforeInit();
    mwd = document.getElementById("mw_datasrv").contentWindow;
    mwResize();
}
function mwMessageDeal(event) {
    let msg = JSON.parse(event.data);
    let ctime = new Date().getTime();
    switch (msg.type) {
        case "MWAlert":
            alert(msg.content);
            break;
        case "MWStat":
            mwc.stat = msg;
            mwUpdateHomeUI();
            break;
        case "MWEpisode":
            mwc.episode = msg.words;
            mwShowStudy();
            mwStudyNext();
            break;
        case "MWSearchResult":
            mwf.imexportText.value = msg.result;
            break;
        case "MWAddWordSuccess":
            mwStatAdd(msg.mword, ctime);
            mwShowPrompt("Add Success!");
            mwUpdateHomeUI();
            break;
        case "MWAddWordFailure":
            mwShowPrompt("Add Failure!");
            break;
        case "MWDeleteWordSuccess":
            mwStatSub(msg.mword, ctime);
            mwShowPrompt("Delete Success!");
            mwUpdateHomeUI();
            break;
        case "MWDeleteWordFailure":
            mwShowPrompt("Delete Failure!");
            break;
        case "MWUpdateWordSuccess":
            mwStatSub(msg.oword, ctime);
            mwStatAdd(msg.mword, ctime);
            mwShowPrompt("Update Success!");
            mwUpdateHomeUI();
            break;
        case "MWUpdateWordFailure":
            mwShowPrompt("Update Failure!");
            break;
        case "MWImportResult":
            mwShowPrompt(`Import Success: ${msg.success} Failure: ${msg.failure} !`);
            break;
        case "MWDeleteBatchResult":
            mwShowPrompt(`Delete Success: ${msg.success} Failure: ${msg.failure} !`);
            break;
    }
}
var mwc = new MWCore();
var mwd = null;
var mwf = new MWFace();
mwFlatInit();
mwInit();
