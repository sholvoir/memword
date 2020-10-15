var mwdb = null;
function mwRead() {
  let request = indexedDB.open("MemWord", 1);
  request.onerror = function(event) { mwSendToParent(new MWAlert(`Database Error: ${event.message}`)); }
  request.onupgradeneeded = function(event) {
    let db = event.target.result;
    let store = db.createObjectStore("MWord", {keyPath: "word"});
    store.createIndex("level", "level");
    store.createIndex("last", "last");
    store.createIndex("next", "next");
  }
  request.onsuccess = function(event) {
    mwdb = event.target.result;
    mwdb.onerror = function(ev) { alert(`Database Error: ${ev.message}`); }
  }
}
function t1() {
  let p = "";
  let ctime = new Date().getTime();
  document.getElementById("b1").value = ctime.toString();
  mwdb.transaction(["MWord"]).objectStore("MWord").index("next").openCursor().onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      p += `${cursor.value.next}\n`
      cursor.continue();
    }
    else document.getElementById("t1").value = p;
  }
}
function t2() {
  let p = "";
  let ctime = new Date().getTime();
  document.getElementById("b2").value = ctime.toString();
  mwdb.transaction(["MWord"]).objectStore("MWord").index("next").openCursor(null, "prev").onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      p += `${cursor.value.next}\n`
      cursor.continue();
    }
    else document.getElementById("t2").value = p;
  }
}
function t3() {
  let p = "";
  let ctime = new Date().getTime();
  document.getElementById("b3").value = ctime.toString();
  mwdb.transaction(["MWord"]).objectStore("MWord").index("next").openCursor(IDBKeyRange.lowerBound(ctime)).onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      p += `${cursor.value.next}\n`
      cursor.continue();
    }
    else document.getElementById("t3").value = p;
  }
}
function t4() {
  let p = "";
  let ctime = new Date().getTime();
  document.getElementById("b4").value = ctime.toString();
  mwdb.transaction(["MWord"]).objectStore("MWord").index("next").openCursor(IDBKeyRange.upperBound(ctime)).onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      p += `${cursor.value.next}\n`
      cursor.continue();
    }
    else document.getElementById("t4").value = p;
  }
}
function t5() {
  let p = "";
  let ctime = new Date().getTime();
  document.getElementById("b5").value = ctime.toString();
  mwdb.transaction(["MWord"]).objectStore("MWord").index("next").openCursor(IDBKeyRange.lowerBound(ctime), "prev").onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      p += `${cursor.value.next}\n`
      cursor.continue();
    }
    else document.getElementById("t5").value = p;
  }
}
function t6() {
  let p = "";
  let ctime = new Date().getTime();
  document.getElementById("b6").value = ctime.toString();
  mwdb.transaction(["MWord"]).objectStore("MWord").index("next").openCursor(IDBKeyRange.upperBound(ctime), "prev").onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      p += `${cursor.value.next}\n`
      cursor.continue();
    }
    else document.getElementById("t6").value = p;
  }
}
