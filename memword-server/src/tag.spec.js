const Tag = require('./tag');
const { int2Tag, tag2Int } = Tag;

describe('Tag', () => {
    xit('int2Tag should translate the int to Tag', () => {
        let tag = int2Tag(0);
        expect(tag.collins).toEqual(0);
        expect(tag.cet4).toEqual(0);
        tag = int2Tag(1021);
        expect(tag.frq).toEqual(5);
        expect(tag.oxford).not.toEqual(0);
        expect(tag.cet4).not.toEqual(0);
        expect(tag.cet6).not.toEqual(0);
    });
    xit('tag2Int should translate the tag to Int', () => {
        expect(tag2Int({})).toEqual(0);
        expect(tag2Int({collins: 0, oxford: 1})).toEqual(8);
        expect(tag2Int({collins: 5, oxford: 1, cet4: true})).toEqual(0x8D);
    })
});