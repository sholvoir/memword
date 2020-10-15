const sql = require('./sql');
const trans = require('./trans');
const speech = require('./speech');

// all function use (req, res) as interface.

const getDictById = async ({params: {id}}) => {
    const dict = await sql.selectDictById(id);
    if (dict.translation && dict.audio) return dict;
    if (!dict.translation) dict.translation = (await trans(dict.word)).dst;
    if (!dict.audio) dict.audio = await speech(dict.word);
    await sql.updateDictById({params: {id: dict.id}, body: dict});
    return dict;
}

//
module.exports = {
    getDictById
};