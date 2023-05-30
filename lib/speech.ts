import { speech as AipSpeechClient } from 'baidu-aip';

const appid = Deno.env.get('BAIDU_AIP_APPID');
const apikey = Deno.env.get('BAIDU_AIP_API_KEY');
const secret = Deno.env.get('BAIDU_AIP_SECRET');

const client = new AipSpeechClient(appid, apikey, secret);

export async function speech(text: string){
    const result = await client.text2audio(text);
    if (result.data) return `data:audio/mpeg;base64,${result.data.toString('base64')}`;
}
