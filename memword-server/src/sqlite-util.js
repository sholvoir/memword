const generalData = (columns, source, dect) => (columns.forEach(column => dect[`$${column}`] = source[column]), dect);
const selectClause = (tableName, queryParameters, query) => {
    const columns = Object.keys(queryParameters).filter(key => query.hasOwnProperty(key));
    const data = generalData(columns, query, {});
    return [`SELECT * FROM ${tableName} WHERE ${columns.map(key => queryParameters[key]).join(' AND ')};`, data];
};
const insertClause = (tableName, columnNames) => `INSERT INTO ${tableName} (${columnNames.join(', ')})
    VALUES (${columnNames.map(column => '$' + column).join(', ')});`;
const insertOrUpdateClause = (tableName, columnNames) => `INSERT OR REPLACE INTO ${tableName}
    (${columnNames.join(', ')}) VALUES (${columnNames.map(column => '$' + column).join(', ')});`;
const updateClause = (tableName, keyNames, columnNames, params, body) => {
    const keys = keyNames.filter(key => params.hasOwnProperty(key));
    const columns = columnNames.filter(column => body.hasOwnProperty(column));
    const data = {};
    keys.forEach(key => data[`$${key}`] = params[key])
    columns.forEach(column => data[`$${column}`] = body[column]);
    return [`UPDATE ${tableName} SET ${columns.map(column => column + ' = $' + column).join(', ')}
        WHERE ${keys.map(key => key + ' = $' + key).join(' AND ')};`, data];
}

module.exports = { generalData, selectClause, insertClause, insertOrUpdateClause, updateClause };