/*
 * MemWord Data Service
*/
class MWBatch extends MWType {
  elements: string[];
  success: number;
  failure: number;
  ctime: number;
  transaction: IDBTransaction;
  store: IDBObjectStore;
  mword: MWWord;
  exec: (e: Event) => any;
  constructor(type: string, source: string) {
    super(type);
    this.ctime = new Date().getTime();
    this.elements = source.split("\n");
    this.success = 0;
    this.failure = 0;
    this.transaction = mwdb.transaction(["MWord"], "readwrite");
    this.transaction.oncomplete = function(event) {
      mwSendToParent(new MWBatchResult(`MW${mwb.type}Result`, mwb.success, mwb.failure));
    }
    this.store = this.transaction.objectStore("MWord");
  }
}

function mwSendToParent(message: MWType) {
  window.parent.postMessage(JSON.stringify(message), "*");
}

function mwOpenDatabase() {
  let request = indexedDB.open("MemWord", 1);
  request.onerror = function(event) { mwSendToParent(new MWAlert(`Database Error: ${event.message}`)); }
  request.onupgradeneeded = function(event) {
    let db = (event.target as IDBRequest).result;
    let store = db.createObjectStore("MWord", {keyPath: "word"});
    store.createIndex("level", "level");
    store.createIndex("last", "last");
    store.createIndex("next", "next");
  }
  request.onsuccess = function(event) {
    mwdb = (event.target as IDBRequest).result;
    mwdb.onerror = function(ev) { mwSendToParent(new MWAlert(`Database Error: ${ev.message}`)); }
    mwRsponseGetStat(new MWType('MWGetStat'));
  }
}

function mwRsponseGetStat(msg: MWType) {
  let stat = new MWStat();
  let transaction = mwdb.transaction(["MWord"]);
  transaction.oncomplete = function(ev) {
    for (let i = 0; i < 5; i++) {
      stat.task[6] += stat.task[i];
      stat.total[6] += stat.total[i];
    }
    mwSendToParent(stat);
  }
  let store = transaction.objectStore("MWord");
  let ctime = new Date().getTime();
  store.openCursor().onsuccess = function(ev) {
    let cursor = (ev.target as IDBRequest).result;
    if (cursor) {
      let mword = cursor.value;
      let blevel = mwGetBLevel(mword.level);
      stat.total[blevel] += 1;
      if (ctime >= mword.next) stat.task[blevel] += 1;
      if (mword.hard > 0) {
        stat.total[5] += 1;
        if (ctime >= mword.next) stat.task[5] += 1;
      }
      cursor.continue();
    }
  }
}

function mwResponseEpisode(msg: MWGetEpisode) {
  let words: MWWord[] = [];
  let ctime = new Date().getTime();
  mwdb.transaction(["MWord"]).objectStore("MWord").index("next").openCursor(IDBKeyRange.upperBound(ctime), "prev").onsuccess = function(event) {
    let cursor = (event.target as IDBRequest).result;
    if (cursor && words.length < msg.top) {
      let mword = cursor.value;
      if (mword.level >= msg.levelmin && mword.level <= msg.levelmax && mword.hard >= msg.hardmin && mword.hard <= msg.hardmax) words.push(mword);
      cursor.continue();
    }
    else mwSendToParent(new MWEpisode(words));
  }
}

function mwResponseAddWord(msg: MWAddWord) {
  let mword = msg.mword;
  let store = mwdb.transaction(["MWord"], "readwrite").objectStore("MWord");
  store.get(mword.word).onsuccess = function(event) {
    let oword = (event.target as IDBRequest).result;
    if (oword) {
      msg.type += "Failure";
      mwSendToParent(msg);
    }
    else store.add(mword).onsuccess = function(ev) {
      msg.type += "Success";
      mwSendToParent(msg);
    }
  }
}

function mwResponseDeleteWord(msg: MWDeleteWord) {
  let mword = msg.mword;
  let store = mwdb.transaction(["MWord"], "readwrite").objectStore("MWord");
  store.get(mword.word).onsuccess = function(event) {
    let oword = (event.target as IDBRequest).result;
    if (oword) store.delete(mword.word).onsuccess = function(ev) {
      msg.type += "Success";
      mwSendToParent(msg);
    }
    else {
      msg.type += "Failure";
      mwSendToParent(msg);
    }
  }
}

function mwResponseUpdateWord(msg: MWUpdateWord) {
  let mword = msg.mword;
  let store = mwdb.transaction(["MWord"], "readwrite").objectStore("MWord");
  store.get(mword.word).onsuccess = function(event) {
    let oword = (event.target as IDBRequest).result;
    if (oword) {
      if (mword.last < oword.last) {
        msg.type += "Failure";
        (msg as any).oword = oword;
        mwSendToParent(msg);
      }
      else store.put(mword).onsuccess = function(ev) {
        msg.type += "Success";
        (msg as any).oword = oword;
        mwSendToParent(msg);
      }
    } else store.add(mword).onsuccess = function(ev) {
      msg.type = "MWAddWordSuccess";
      mwSendToParent(msg);
    }
  }
}

function mwResponseSearch(msg: MWSearch) {
  let result = "";
  let rx = new RegExp(msg.wordpatten, "i");
  mwdb.transaction(["MWord"]).objectStore("MWord").openCursor().onsuccess = function(event) {
    let cursor = (event.target as IDBRequest).result;
    if (cursor) {
      let mword = cursor.value as MWWord;
      if (rx.test(mword.word)
        && mword.level >= msg.levelmin && mword.level <= msg.levelmax
        && mword.hard >= msg.hardmin && mword.hard <= msg.hardmax
        && mword.last >= msg.lastmin && mword.last <= msg.lastmax
        && mword.next >= msg.nextmin && mword.next <= msg.nextmax)
        result += `${JSON.stringify(mword)}\n`;
      cursor.continue();
    } else mwSendToParent(new MWSearchResult(result));
  }
}

function mwBatch1() {
  let element = "";
  while (mwb.elements.length > 0 && element.length === 0) element = mwb.elements.pop().trim();
  if (element.length > 0) {
    mwb.mword = MWWordParse(element);
    mwb.store.get(mwb.mword.word).onsuccess = mwb.exec;
  }
}

function mwBatch2() {
  mwb.failure += 1;
  mwBatch1();
}

function mwBatch3(e: Event) {
  mwb.success += 1;
  mwBatch1();
}


function mwImport2(e: Event) {
  let oword = (event.target as IDBRequest).result;
  if (oword) {
    if (mwb.mword.last < oword.last || mwb.mword.level === 0) mwBatch2();
    else mwb.store.put(mwb.mword).onsuccess = mwBatch3;
  } else mwb.store.add(mwb.mword).onsuccess = mwBatch3;
}


function mwResponseImport(msg: MWImport) {
  mwb = new MWBatch("Import", msg.source);
  mwb.exec = mwImport2;
  mwBatch1();
}

function mwDeleteB2(e: Event) {
  let oword = (event.target as IDBRequest).result
  if (oword) mwb.store.delete(mwb.mword.word).onsuccess = mwBatch3;
  else mwBatch2();
}

function mwResponseDeleteBatch(msg: MWDeleteBatch) {
  mwb = new MWBatch("DeleteBatch", msg.source);
  mwb.exec = mwDeleteB2
  mwBatch1();
}

function mwResponseSynchronize(msg: MWType) {
  mwSendToParent(new MWAlert("Synchronize Success!"));
}

function mwDealMessage(event: MessageEvent) {
  let msg = JSON.parse(event.data);
  switch (msg.type) {
    case "MWGetStat": mwRsponseGetStat(msg); break;
    case "MWGetEpisode": mwResponseEpisode(msg); break;
    case "MWAddWord": mwResponseAddWord(msg); break;
    case "MWDeleteWord": mwResponseDeleteWord(msg); break;
    case "MWUpdateWord": mwResponseUpdateWord(msg); break;
    case "MWSearch": mwResponseSearch(msg); break;
    case "MWImport": mwResponseImport(msg); break;
    case "MWDeleteBatch": mwResponseDeleteBatch(msg); break;
    case "MWSynchronize": mwResponseSynchronize(msg); break;
  }
}

var mwb: MWBatch = null;
var mwdb: IDBDatabase = null;
window.addEventListener('message', mwDealMessage);
mwOpenDatabase();
