const trans = require('./trans');

describe('trans', () => {
    xit('should get tranlation from baidu', async () => {
        const t = await trans('hello');
        console.log(t);
        expect(t.src).not.toBeNull();
    })
});