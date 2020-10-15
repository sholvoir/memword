const fs = require('fs');
const http = require("http");

class MWWord {
    constructor(word, level, hard, last, next, star, answer, sound) {
        this.word = word;
        this.level = level;
        this.hard = hard;
        this.last = last;
        this.next = next;
        this.star = star;
        this.answer = answer;
        this.sound = sound;
    }
}

let outStar5 = fs.createWriteStream('star1.txt', {
    flags: 'a',
    defaultEncoding: 'utf8',
    autoClose: true
});

const n = /\r?\n/;
const words = fs.readFileSync('/home/sovar/Html/Micit/micit.cn/down/Collins1.txt', 'utf8').split(n);

let index;

function start() {
    if (index < words.length) {
        let word = words[index];
        if (word.length > 0) {
            http.get(`http://localhost:9333/api/translate?query=${word}&targetLang=zh_CN&sourceLang=en`, (res) => {
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => rawData += chunk);
                res.on('end', () => {
                    try {
                        let parsedData = JSON.parse(rawData);
                        let answer = parsedData.extract.translation;
                        http.get(`http://localhost:9333/api/tts?query=${word}&language=en`, (res2) => {
                            var data = [];
                            res2.on('data', (chunk) => data.push(chunk));
                            res2.on('end', () => {
                                var buffer = Buffer.concat(data);
                                let sound = buffer.toString('base64');
                                let mwword = new MWWord(word, 0, 0, 0, 0, 1, answer, "data:audio/mpeg;base64," + sound);
                                outStar5.write(JSON.stringify(mwword));
                                outStar5.write('\n');
                                console.log(`${index}, ${word}`);
                                index += 1;
                                start();
                            });
                        }).on('error', (e) => {
                            console.log(`Got error: ${e.message}`);
                        });
                    } catch (e) {
                      console.log(e.message);
                    }
                });
            }).on('error', (e) => {
                console.log(`Got error: ${e.message}`);
            });
        } else {
            console.log(`${index}, ${word}`);
            index += 1;
        }
    } else {
        outStar5.end();
    }
}

index = 7432;
start();