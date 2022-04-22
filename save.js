const { createGzip } = require('zlib');
const { promisify } = require('util');
const { stdout } = require('process');
const { createHash } = require('crypto');
const { pipeline } = require('stream');
const { copyFile, rename, readFile, writeFile, rm } = require('fs/promises');
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

const CACHE = require('./cache');

async function compress(input, output) {
    const gzip = createGzip();
    const source = createReadStream(input);
    const destination = createWriteStream(output);

    await pipe(source, gzip, destination);
}

async function calculateSHA(blob) {
    const source = await readFile(blob);
    return sha1.update(source).digest('hex');
}

async function addToDB(fileName, fileNameHash) {
    const newPath = path.join(OBJECTS_DIR, fileNameHash.substring(0,2), fileNameHash.substring(2));
    await rename(fileName, newPath);
    return newPath;
}

(async () => {
    const tempFileName = path.join(__dirname, '/temp_db');
    const tree = await CACHE();
    tree.unshift({
        type: 'tree',
        created: (new Date()).getTime(),
    });
    await copyFile(CACHE_PATH, tempFileName);
    const tempFileNameHash = await calculateSHA(tempFileName);
    await compress(tempFileName, tempFileNameHash);
    addToDB(tempFileName, tempFileNameHash);
    rm(tempFileNameHash)
    
    // reset cache for new tree
    await CACHE([]);
    console.log('tree saved -> ', tempFileNameHash);
})();