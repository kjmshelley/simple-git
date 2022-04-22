const { createUnzip } = require('zlib');
const { promisify } = require('util');
const { stdout } = require('process');
const { createHash } = require('crypto');
const { pipeline } = require('stream');
const { copyFile, rm } = require('fs/promises');
const path = require('path');
const pipe = promisify(pipeline);
const sha1 = createHash('sha1');

const {
    createReadStream,
    createWriteStream,
} = require('fs');

const {
    MAIN_DIR,
    WORKSPACE_DIR,
    CACHE_PATH,
    OBJECTS_DIR,
} = require('./config');

const CACHE = require('./db');

async function getFileFullyQualifiedPath(fileName) {
    return path.join(OBJECTS_DIR, fileName.substring(0,2), '/', fileName.substring(2));
}

async function uncompress(tempFilePath, fileName) {
    const newFileName = `temp_${(new Date()).getTime().toString()}_${fileName}`;
    
    const unzip = createUnzip();
    const source = createReadStream(tempFilePath);
    const destination = createWriteStream(newFileName);

    await pipe(source, unzip, destination);

    return newFileName;
}

async function getFromDB(fileName) {
    const tempFileName = path.join(__dirname, '/', (new Date()).getTime().toString());
    await copyFile(fileName, tempFileName);
    return tempFileName;
}

async function cleanup(fileName) {
    await rm(fileName);
}

(async () => {
    const files = process.argv.slice(2);

    for await (let file of files) {
        const obj = await DB({ shaName: file });

        //const fullPathInProjectDir = await getFileFullyQualifiedPath(file);
        const tempFilePath = await getFromDB(obj.loc);
        const newFile = await uncompress(tempFilePath, obj.name);

        await cleanup(tempFilePath);
        console.log(`${file} output -> ${newFile}`);
    }
})();