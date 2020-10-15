const fs = require('fs');
import MWWord from "./mwdata";
let outRemain5 = fs.createWriteStream('remain5.txt', {
    encoding: 'utf8'
});
let outStar5 = fs.createWriteStream('star5.txt', {
    encoding: 'utf8'
});
const n = /\r?\n/;
const ctime = new Date().getTime();
let remain = new Map();
fs.readFileSync('/home/sovar/Documents/Other/memword', 'utf8').split(n).forEach((mwordstr) => {
    if (mwordstr.length > 0) {
        let mword = JSON.parse(mwordstr);
        remain.set(mword.word, mwordstr);
    }
});
fs.readFileSync('/home/sovar/Html/Micit/micit.cn/down/Collins5.txt', 'utf8').split(n).forEach((word) => {
    if (word.length > 0) {
        if (remain.has(word)) {
            outStar5.write(remain.get(word));
            outStar5.write('\n');
            remain.delete(word);
        } else {
            outStar5.write(JSON.stringify(new MWWord(word, 0, 0, ctime, ctime)));
        }
    }
});
outStar5.end();
remain.forEach((value, key) => {
    outRemain5.write(value);
});
outRemain5.end();
