function exec() {
    var data = document.getElementsByClassName("krecordwidget");
    for (var i = 0; i < data.length; i++) {
        var xx = data[i];
        var a1 = xx.children[1];
        var a2 = a1.children[0];
        var a3 = a2.children[0];
        var a4 = a3.children[1];
        var a5 = a4.children[0];
        var a6 = a5.children[0];
        var word = a6.innerText;
        var b1 = xx.children[4];
        var b2 = b1.children[0];
        var b3 = b2.innerText;
        var last = new Date(b3.substr(6, 10)).getTime();
        var c1 = b1.children[6];
        var c2 = c1.innerText;
        var next = new Date(c2.substr(6, 10)).getTime();
        var d1 = b1.children[2];
        var d2 = d1.innerText;
        var level = parseInt(d2.substr(5, 4));
        localStorage.setItem(word, level + "," + last + "," + next);
    }
}
function xxx() {
    var page = parseInt(window.location.href.substr(56, 3));
    exec();
    page++;
    if (page < 934) {
        window.location.href = "http://www.yibei.com/myrote/mem/kbiid/1/rank/0/Mem_page/" + page;
    }
    else {
        var t = "<pre>\n";
        for (var word in localStorage) {
            t += word + ":" + localStorage.getItem(word) + "\n";
        }
        t += "</pre>";
        document.body.innerHTML = t;
        localStorage.clear();
    }
}
xxx();
