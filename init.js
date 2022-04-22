const path = require('path');
const { mkdir, rm, writeFile } = require('fs/promises');
const {
    MAIN_DIR,
    WORKSPACE_DIR,
    CACHE_PATH,
    DB_PATH,
    OBJECTS_DIR,
} = require('./config');

function* seq() {
    for (let i = 1; i <= 255; i++) {
        yield i;
    }
}

async function createDir(dir) {
    try {
        await mkdir(dir);
        return true;
    } catch (ex) {
        return false;
    }
}

(async () => {
    if(!(await createDir(WORKSPACE_DIR))) {
        console.log('Workspace directory already exist or failed to create it');
        return;
    }

    if(!(await createDir(OBJECTS_DIR))) {
        console.log('Object directory already created or failed to create it');
        return;
    }

    await writeFile(CACHE_PATH, '[]');
    await writeFile(DB_PATH, '[]');

    for await (let idx of [0, ...seq()]) {
        const created = await createDir(path.join(OBJECTS_DIR, idx.toString(16)));
        if (!created) {
            console.log('Objects already exist or failed to create them');

            await rm(WORKSPACE_DIR, { maxRetries: 3, recursive: true, retryDelay: 100 });
            process.exit(-1);
        }
    }
})();