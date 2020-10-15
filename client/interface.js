/*
 * Author： Sovar He
 * Level: 0 ~ 15
 * Blevel: 0 ~ 4  5 mean all blevel
 * Hard: 0 ~ 4  5 mean all hard
 * times: 0, 1m, 5m, 30m, 90m, 6h, 24h, 42h, 72h, 7d, 13d, 25d, 49d, 97d, 191d, 367d
 */
class MWCore {
  levels: number[];
  episodeInsert: number[];
  episodeInsertTimes: number[];
  nextTimes: number[];
  episode: MWWord[];
  stat: MWStat;
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
  colors: string[];
  cword: MWWord;
  cblevel: number;
  cwordClass: string;
  blevelBanners: HTMLElement[];
  blevelNumbers: HTMLElement[];
  blevelSelect: HTMLSelectElement;
  wordText: HTMLElement;
  imexportText: HTMLTextAreaElement;
  timeText: HTMLElement;
  remainderText: HTMLElement;
  searchInput: HTMLInputElement;
  homeDiv: HTMLElement;
  studyDiv: HTMLElement;
  dialogDiv: HTMLElement;
  answerDiv: HTMLElement;
  promptDiv: HTMLElement;
  levelText1: HTMLInputElement;
  levelText2: HTMLInputElement;
  inTaskCheck: HTMLInputElement;
  constructor() {
    this.cwordClass = "mw-text-word1";
    this.colors = ["DarkRed", "Blue", "Orange", "Olive", "ForestGreen", "DarkGray"];
  }
}

function mwSendToService(msg: MWType) {
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

  mwf.searchInput = document.getElementById("mw_search_input") as HTMLInputElement;
  mwf.imexportText = document.getElementById("mw_imexport_text") as HTMLTextAreaElement;
  mwf.levelText1 = document.getElementById("mw_level1") as HTMLInputElement;
  mwf.levelText2 = document.getElementById("mw_level2") as HTMLInputElement;
  mwf.inTaskCheck = document.getElementById("mw_in_task") as HTMLInputElement;

  mwf.blevelSelect = document.getElementById("mw_blevel_select") as HTMLSelectElement;
  mwf.timeText = document.getElementById("mw_time_div");
  mwf.remainderText = document.getElementById("mw_remainder");
  mwf.wordText = document.getElementById("mw_word_text");
}

function mwTimeToString(time: number) {
  let remain = Math.floor(time / 86400000);
  if (remain > 0) return  `${remain}d`;
  remain = Math.floor(time / 3600000);
  if (remain > 0) return `${remain}h`;
  remain = Math.floor(time / 60000);
  if (remain > 0) return `${remain}m`;
  return "1m";
}

function mwStatSub(mword: MWWord, ctime: number) {
  let blevel = mwGetBLevel(mword.level);
  mwc.stat.total[blevel] -= 1;
  mwc.stat.total[6] -= 1;
  if (ctime >= mword.next) {
    mwc.stat.task[blevel] -= 1;
    mwc.stat.task[6] -= 1;
  }
  if (mword.hard > 0) {
    mwc.stat.total[5] -= 1;
    if (ctime >= mword.next) mwc.stat.task[5] -= 1;
  }

}

function mwStatAdd(mword: MWWord, ctime: number) {
  let blevel = mwGetBLevel(mword.level);
  mwc.stat.total[blevel] += 1;
  mwc.stat.total[6] += 1;
  if (ctime >= mword.next) {
    mwc.stat.task[blevel] += 1;
    mwc.stat.task[6] += 1;
  }
  if (mword.hard > 0) {
    mwc.stat.total[5] += 1;
    if (ctime >= mword.next) mwc.stat.task[5] += 1;
  }
}

function mwUpdateLevel(mword: MWWord) {
  if (mword.level > 15) mwSendToService(new MWDeleteWord(mword));
  else {
    let ctime = new Date().getTime();
    mword.last = ctime;
    if (mword.hard > 0) mword.next = ctime;
    else mword.next = ctime + mwc.nextTimes[mword.level];
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
  mwf.answerDiv.style.display = "none"
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
  if (word.length > 0) mwSendToService(new MWAddWord(mwDefaultWord(word)));
}

function mwChangeWordClassTo(cls: string) {
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
    if (mwf.cword.word.length > 30) mwChangeWordClassTo("mw-text-word3");
    else if (mwf.cword.word.length > 15) mwChangeWordClassTo("mw-text-word2");
    else mwChangeWordClassTo("mw-text-word1");
  } else mwf.answerDiv.style.display = "none";
}

function mwIKnowItClick() {
  if (mwf.cword.hard > 0) mwf.cword.hard --;
  else mwf.cword.level += 1;
  mwUpdateLevel(mwf.cword);
}

function mwDontKnowClick() {
  if (mwf.cword.level === 0) mwf.cword.level = 1;
  else if (0 >= mwf.cword.hard && mwf.cblevel > 1) mwf.cword.level -= (mwf.cblevel - 1);
  let times = mwc.episodeInsertTimes[mwf.cword.hard];
  mwf.cword.hard = 4;
  for (let i = 0; i < times; i++) {
    let index = mwc.episode.length - mwc.episodeInsert[i];
    if (index >= 0) mwc.episode.splice(index, 0, mwf.cword);
  }
  mwUpdateLevel(mwf.cword);
}

function mwDeleteButtonClick() {
  mwSendToService(new MWDeleteWord(mwf.cword));
  mwStudyNext();
}

function mwBLevelChange() {
  let blevel = parseInt(mwf.blevelSelect.value);
  if (blevel === mwf.cblevel) return;
  mwf.cword.level = mwc.levels[blevel];
  mwUpdateLevel(mwf.cword);
}

function mwKeyPress(event: KeyboardEvent) {
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
  if (!isNaN(level1)) search.levelmin = level1;
  let level2 = parseInt(mwf.levelText2.value);
  if (!isNaN(level2)) search.levelmax = level2;
  if (mwf.inTaskCheck.checked) search.nextmax = new Date().getTime();
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
  mwd = (document.getElementById("mw_datasrv") as HTMLIFrameElement).contentWindow;
  mwResize();
}

function mwMessageDeal(event: MessageEvent) {
  let msg = JSON.parse(event.data);
  let ctime = new Date().getTime();
  switch (msg.type) {
    case "MWAlert": alert(msg.content); break;
    case "MWStat": mwc.stat = msg; mwUpdateHomeUI(); break;
    case "MWEpisode": mwc.episode = msg.words; mwShowStudy(); mwStudyNext(); break;
    case "MWSearchResult": mwf.imexportText.value = msg.result; break;
    case "MWAddWordSuccess": mwStatAdd(msg.mword, ctime); mwShowPrompt("Add Success!"); mwUpdateHomeUI(); break;
    case "MWAddWordFailure": mwShowPrompt("Add Failure!"); break;
    case "MWDeleteWordSuccess": mwStatSub(msg.mword, ctime); mwShowPrompt("Delete Success!"); mwUpdateHomeUI(); break;
    case "MWDeleteWordFailure": mwShowPrompt("Delete Failure!"); break;
    case "MWUpdateWordSuccess": mwStatSub(msg.oword, ctime); mwStatAdd(msg.mword, ctime); mwShowPrompt("Update Success!"); mwUpdateHomeUI(); break;
    case "MWUpdateWordFailure": mwShowPrompt("Update Failure!"); break;
    case "MWImportResult": mwShowPrompt(`Import Success: ${msg.success} Failure: ${msg.failure} !`); break;
    case "MWDeleteBatchResult": mwShowPrompt(`Delete Success: ${msg.success} Failure: ${msg.failure} !`); break;
  }
}

var mwc = new MWCore();
var mwd: Window = null;
var mwf = new MWFace();
mwFlatInit();
mwInit();
