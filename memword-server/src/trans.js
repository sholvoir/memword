const fetch = require('node-fetch');
const md5 = require('md5');

const appid = '20190320000279064';
const secret = 'UETw5_0eIUU8n3ak2EUH';
const server = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

const trans = async (en) => {
    const salt = Date.now();
    const sign = md5(`${appid}${en}${salt}${secret}`);
    const response = await fetch(`${server}?from=en&to=zh&appid=${appid}&q=${encodeURIComponent(en)}&salt=${salt}&sign=${sign}`);
    if (response.status != 200) return null;
    const result = await response.json();
    return result.trans_result[0];
}

module.exports = trans;