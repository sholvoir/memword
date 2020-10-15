function exec() {
  let data = document.getElementsByClassName("krecordwidget");
  for (let i = 0; i < data.length; i++) {
    let xx = data[i] as HTMLDivElement;
    let a1 = xx.children[1] as HTMLTableElement;
    let a2 = a1.children[0] as HTMLElement;
    let a3 = a2.children[0] as HTMLElement;
    let a4 = a3.children[1] as HTMLElement;
    let a5 = a4.children[0] as HTMLElement;
    let a6 = a5.children[0] as HTMLElement;
    let word = a6.innerText;
    let b1 = xx.children[4] as HTMLElement;
    let b2 = b1.children[0] as HTMLElement;
    let b3 = b2.innerText;
    let last = new Date(b3.substr(6, 10)).getTime();
    let c1 = b1.children[6] as HTMLElement;
    let c2 = c1.innerText;
    let next = new Date(c2.substr(6, 10)).getTime();
    let d1 = b1.children[2] as HTMLElement;
    let d2 = d1.innerText;
    let level = parseInt(d2.substr(5,4));
    localStorage.setItem(word, `${level},${last},${next}`);
  }
}

function xxx() {
  let page = parseInt(window.location.href.substr(56, 3));
  exec();
  page++;
  if (page < 934) {
    window.location.href = "http://www.yibei.com/myrote/mem/kbiid/1/rank/0/Mem_page/" + page;
  } else {
    let t = "<pre>\n";
    for (let word in localStorage) {
      t += `${word}:${localStorage.getItem(word)}\n`;
    }
    t += "</pre>"
    document.body.innerHTML = t;
    localStorage.clear();
  }
}

xxx();
