const { createGzip } = require('zlib');
const { promisify } = require('util');
const { stdout } = require('process');
const { createHash } = require('crypto');
const { pipeline } = require('stream');
const { rename, stat, readFile, writeFile } = require('fs/promises');
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

async function saveMetaData(fileName, compressFileLocation, fileNameHash) {
    const info = await stat(fileName);

    CACHE({
        name: fileName,
        shaName: fileNameHash,
        loc: compressFileLocation,
        size: info.size,
        created: info.birthtimeMs,
        lastUpdate: info.ctimeMs,
        updatedBy: 'TODO',
    });
}

(async () => {
    const files = process.argv.slice(2);    
    for await (let file of files) {
        try {
            const tempFileName = path.join(__dirname, '/', (new Date()).getTime().toString());
            await compress(file, tempFileName);
            const fileNameHash = await calculateSHA(tempFileName);
            const compressedFileLocation = await addToDB(tempFileName, fileNameHash);
            await saveMetaData(path.basename(file), compressedFileLocation, fileNameHash);
            
            console.log(`${file} -> ${fileNameHash}`);
        } catch (ex) {
            console.log(ex);
        }
    }

})();