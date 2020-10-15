const speech = require('./speech');

describe('speech', () => {
    xit('should get speech from baidu', async () => {
        const sound = await speech('hello');
        expect(sound).toContain('data:audio/mpeg;base64');
    })
});