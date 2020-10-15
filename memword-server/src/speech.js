const AipSpeechClient = require('baidu-aip-sdk').speech;
const appid = '15799049';
const apikey = '89EcrG0lO0IPUqr0jY4R8V54';
const secret = 'UAPH47wfZVzYKiT7yohBCgSXBjTDozZI';
const client = new AipSpeechClient(appid, apikey, secret);

const speech = async (text) => {
    const result = await client.text2audio(text);
    return result.data && 'data:audio/mpeg;base64,' + result.data.toString('base64');
}

module.exports = speech;