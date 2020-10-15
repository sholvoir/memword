const { generalData, selectClause, insertClause, insertOrUpdateClause, updateClause } = require('./sqlite-util');

describe('SQLite-Util', () => {
    beforeAll(() => jasmine.addCustomEqualityTester((obj1, obj2) => {
        if (typeof (obj1) == 'string' && typeof (obj2) == 'string')
            return obj1.replace(/\s+/g, ' ').toUpperCase() == obj2.replace(/\s+/g, ' ').toUpperCase();
        if (typeof (obj1) == 'object' && typeof (obj2) == 'object')
            return JSON.stringify(obj1) == JSON.stringify(obj2);
        return undefined;
    }));
    it('generalData should generate data for sqlite use', () => {
        const data = generalData(['a', 'b'], { a: 1, b: 2 }, {});
        expect(data).toEqual({ $a: 1, $b: 2 });
    });
    it('selectClause should generate SELECT clause', () => {
        const [select1, data1] = selectClause('table', { agt: 'a > $agt', b: 'b = $b' }, { agt: 5, b: 4 });
        expect(select1).toEqual('SELECT * FROM table WHERE a > $agt AND b = $b;');
        expect(data1).toEqual({ $agt: 5, $b: 4 });
        const [select2, data2] = selectClause('table', { agt: 'a > $agt', b: 'b = $b' }, { agt: 5 });
        expect(select2).toEqual('SELECT * FROM table WHERE a > $agt;');
        expect(data2).toEqual({ $agt: 5 });
    });
    it('insertClause should generate INSERT clause', () => {
        const insert = insertClause('table', ['a', 'b']);
        expect(insert).toEqual('INSERT INTO table (a, b) VALUES ($a, $b);');
    });
    it('insertOrUpdateClause should generate INSERT OR REPLACE clause', () => {
        const insertOrReplace = insertOrUpdateClause('table', ['a', 'b']);
        expect(insertOrReplace).toEqual('INSERT OR REPLACE INTO table (a, b) VALUES ($a, $b);');
    });
    it('updateClause should generate UPDATE clause', () => {
        const [update, data] = updateClause('table', ['id1', 'id2'], ['c1', 'c2'], { id1: 4, id2: 5 }, { c1: 3, c2: 2 });
        expect(update).toEqual('UPDATE table SET c1 = $c1, c2 = $c2 WHERE id1 = $id1 AND id2 = $id2;');
        expect(data).toEqual({$id1: 4, $id2: 5, $c1: 3, $c2: 2 });
    });
});