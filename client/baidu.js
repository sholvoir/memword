class MWFlatB {
  prompts: string[];
  promptc: number;
  transText: HTMLTextAreaElement;
  listenElem: HTMLLinkElement;
  translateButton: HTMLLinkElement;
  constructor() {
    this.prompts = ["", "", ""];
    this.promptc = 0;
    this.transText = document.getElementById("baidu_translate_input") as HTMLTextAreaElement;
    let x = document.getElementsByClassName("operate-btn op-sound data-hover-tip");
    let t: Array<Element> = [];
    for (let i in x)
      if ("http://fanyi.baidu.com/###" === (x[i] as HTMLLinkElement).href)
        t.push(x[i]);
    if (1 !== t.length) alert("Cannot Find the Sound Button, Please contact the Author.")
    else this.listenElem = t[0] as HTMLLinkElement;
    this.translateButton = document.getElementById("translate-button") as HTMLLinkElement;
  }
}

function mwTranslationIt(word: string) {
  mwp.transText.value = word + "\n";
  mwp.translateButton.click();
}

function mwSpeakIt() {
  setTimeout(mwSpeakIt1, 100);
}

function mwSpeakIt1() {
  mwp.listenElem.click();
  mwf.studyDiv.focus();
}

function mwFlatInit() {
  let mwCss = document.createElement('link');
  mwCss.rel = "stylesheet";
  mwCss.href = "http://micit.cn/css/memword-b.css";
  document.head.appendChild(mwCss);
  console.log("Flat init");
}

function mwResize() {
  let w = window.innerWidth
  let headerWidth = (w <= 1024 ? 964 : w <= 1279 ? w - 100 : w <= 1365 ? 1120 : 1220) - 195 + "px" ;
  let headerLeft = (w <= 1004 ? 20 : w <= 1024 ? (w - 964) / 2 : w <= 1279 ? 50 : w <= 1365 ? (w - 1120) / 2 : (w - 1220) / 2) + 100 + "px";
  mwf.homeDiv.style.width = headerWidth;
  mwf.studyDiv.style.width = headerWidth;
  mwf.homeDiv.style.left = headerLeft;
  mwf.studyDiv.style.left = headerLeft;
  let articleHeight = window.innerHeight - 60 + "px";
  mwf.dialogDiv.style.height = articleHeight;
  mwf.answerDiv.style.height = articleHeight;
  mwf.searchInput.style.width = window.innerWidth - 80 * 4 - 235 + "px";
  mwf.imexportText.style.width = window.innerWidth - 35 + "px";
  mwf.imexportText.style.height = window.innerHeight - 105 + "px";
}

function mwShowPrompt(prompt: string) {
  mwp.promptc += 1;
  mwp.prompts.push(`${mwp.promptc}. ${prompt}`);
  while (mwp.prompts.length > 4) mwp.prompts.shift();
  mwf.promptDiv.innerHTML = `${mwp.prompts[0]} &nbsp; ${mwp.prompts[1]} &nbsp; ${mwp.prompts[2]} &nbsp; ${mwp.prompts[3]}`;
}

var mwp = new MWFlatB();
