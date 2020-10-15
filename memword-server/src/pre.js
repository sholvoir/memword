const fs = require('fs');
const path = require('path');
const dbm = require('./dbm');
const sql = require('./sql');
const { tag2Int, int2Tag, frq2rank } = require('./tag');

const version = Date.now();

const readjson = (filename) => JSON.parse(fs.readFileSync(path.join(dbm.dataPath, filename), 'utf8'));
const writejson = (data, filename) => fs.writeFileSync(path.join(dbm.dataPath, filename), JSON.stringify(data, null, 2));

const dictPre1 = async () => {
    try {
        let lastid = 0;
        while (true) {
            const stardictRows = await dbm.run('ecdict28', 'all',
                'SELECT * FROM stardict WHERE id > $lastid ORDER BY id LIMIT 10000;', {$lastid: lastid});
            if (stardictRows.length == 0) break;
            for (let i = 0; i < stardictRows.length; i++) {
                const { id, word, sw, phonetic, definition, translation, pos, collins,
                    oxford, tag, bnc, frq, exchange, detail, audio } = stardictRows[i];
                const tags = tag ? new Set(tag.split(' ')) : new Set();
                const newTag = tag2Int({
                    frq: frq ? frq2rank(frq) : 0,
                    bnc: bnc ? frq2rank(bnc) : 0,
                    collins: collins || 0,
                    oxford,
                    zhongKao: tags.has('zk'),
                    gaoKao: tags.has('gk'),
                    kaoYan: tags.has('ky'),
                    cet4: tags.has('cet4'),
                    cet6: tags.has('cet6'),
                    toefl: tags.has('toefl'),
                    ielts: tags.has('ielts'),
                    gre: tags.has('gre')
                });
                const [newId] = await sql.insertDict({body: {
                    version,
                    tag: newTag,
                    word,
                    sw,
                    phonetic,
                    definition,
                    translation, 
                    position: pos,
                    morphology: exchange,
                    examples: detail, 
                    audio,
                    picture: null
                }});
                if (id != newId) console.log(id, newId);
                lastid = id;
            }
            process.stdout.write('*');
        };
    } catch (err) {
        console.error(err)
    }
};

const dictPre2 = async (infile) => {
    const mdicts = readjson(infile);
    for (let i = 0; i < mdicts.length; i++) {
        const {id, word} = mdicts[i];
        try {
            if (id) await sql.updateDictById({params: {id}, body: {word}});
            else await sql.insertDict({body: {word, version, tag: 0, sw: word.replace(/[^A-Za-z]/g, '')}});
        } catch (err) {
            console.error(id, word, err);
        }
    }
}

const dictPre3 = async (infile, outfile) => {
    try {
        const mywords = readjson(infile);
        const remains = [];
        for (let i = 0; i < mywords.length; i++) {
            const myword = mywords[i];
            const { word, answer, sound, star } = myword;
            let dictRows = await sql.selectDict({query: {word}});
            if (dictRows.length) {
                let { id, translation, tag} = dictRows[0];
                if (!translation) translation = answer;
                const tagx = int2Tag(tag);
                tagx.collins = Math.max(tagx.collins, star);
                tag = tag2Int(tagx);
                await sql.updateDictById({params: {id}, body: {audio: sound, tag, translation}});
            } else {
                remains.push(myword);
            }
        }
        if (remains.length) writejson(remains, outfile);
    } catch (err) {
        console.error(err);
    }
};

const taskPre = async (infile, outfile) => {
    try {
        const mywords = readjson(infile)
        const remains = [];
        for (let i = 0; i < mywords.length; i++) {
            const { word, level, last, next } = mywords[i];
            const dictRows = await sql.selectDict({query: { word }});
            if (dictRows.length) {
                const { id, tag } = dictRows[0];
                await sql.insertOrUpdateTask({params: {id: (id << 4) + 2}, body: {level, last, next, tag}},
                    { user: {id: 'sholvoir.he@gmail.com'}});
            } else {
                remains.push(mywords[i]);
            }
        }
        if (remains.length) writejson(remains, outfile);
    } catch (err) { console.error(err) }
};

//dictPre1();
//dictPre2('update-dict.json');
//dictPre3('collins.json', 'dict-remain.json');
taskPre('memword.json', 'not-in-dict.json');
