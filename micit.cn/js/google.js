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
