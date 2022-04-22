const { rename, stat, readFile, writeFile } = require('fs/promises');

const {
    DB_PATH,
} = require('./config');

module.exports = async function(obj) {
    const contents = await readFile(DB_PATH, { encoding: 'utf-8' });
    let db = JSON.parse(contents);

    if (!obj) return db;

    let newObj = Object.assign({}, obj);
    if (Object.keys(obj).length > 0) {
        // TODO: refactor this logic
        const idx = db.findIndex(itm => itm.treeId === newObj.treeId);
        if (idx > -1) {
            newObj = Object.assign(db[idx], newObj);
            db[idx] = newObj;
        } else {
            newObj = Object.assign({}, obj);
            db.push(newObj);
        }
    }
    await writeFile(DB_PATH, JSON.stringify(db));
    return newObj;
};