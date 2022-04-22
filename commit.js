const { createGzip } = require('zlib');
const { promisify } = require('util');
const { stdout } = require('process');
const { createHash } = require('crypto');
const { pipeline } = require('stream');
const { copyFile, rename, readFile, writeFile } = require('fs/promises');
const path = require('path');
const pipe = promisify(pipeline);
const sha1 = createHash('sha1');

const {
    createReadStream,
    createWriteStream,
} = require('fs');

const {
    WORKSPACE_DIR,
    DB_PATH,
    OBJECTS_DIR,
} = require('./config');

const DB = require('./db');

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

(async () => {
    const message = process.argv.pop();
    const command = process.argv.pop(); // this should be the command -m
    const treeId = process.argv.pop();
    if (treeId < 40) {
        console.log('usage: commit [treeId] -m [message]');
    }

    await DB({
        treeId,
        message,
        created: (new Date()).getTime(),
    });
    await compress(DB_PATH, `${WORKSPACE_DIR}db.lock`);
})();