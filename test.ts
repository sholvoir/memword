import { Client } from 'minio';

const minioClient = new Client({
    endPoint: 's3.us-east-005.backblazeb2.com',
    useSSL: true,
    accessKey: Deno.env.get('BACKBLAZE_KEY_ID'),
    secretKey: Deno.env.get('BACKBLAZE_APP_KEY')
})

const run = async () => {
    const e = await minioClient.putObject('vocabulary', 'username/test2.txt', 'This is a test file.', 'text/plain');
    console.log(e);
}

if (import.meta.main) run();