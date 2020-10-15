var sqlite3 = require('sqlite3');
const fs = require('fs');
const readline = require('readline');
let x = 5;

var db = new sqlite3.Database('dict', function (err0) {
  if (err0) console.log(err0);
  else {
    db.run('CREATE TABLE dict(word TEXT PRIMARY KEY, star TINYINT, answer TEXT, sound TEXT, pic TEXT, ver INTEGER)', function (err1) {
      if (err1) console.log(err1);
      else {
        let stmt = db.prepare("INSERT INTO dict VALUES (?, ?, ?, ?, ?, ?)");
        for (let i = 5; i > 0; i--) {
          let rl = readline.createInterface({
            input: fs.createReadStream(`/home/sovar/Html/Micit/micit.cn/down/star${i}.txt`)
          });
          console.log(`star${i}`);
          rl.on('line', (line) => {
            let a = JSON.parse(line);
            stmt.run([a.word, a.star, a.answer, a.sound, '', 0], (err2) => {
              if (err2) console.log(err2 + " " + a.word);
              else console.log(a.word);
            });
          });
          rl.on('close', () => {
            rl.close();
            x--;
            if (x === 0) {
              stmt.finalize();
              db.close();
            }
          });
        }
      }
    });
  }
});