const path = require('path');

const MAIN_DIR = `${__dirname}/`;
const WORKSPACE_DIR = path.join(MAIN_DIR, '.workspace/');
const CACHE_PATH = path.join(WORKSPACE_DIR, '.cache');
const DB_PATH = path.join(WORKSPACE_DIR, '.db');
const OBJECTS_DIR = path.join(WORKSPACE_DIR, 'objects/');

module.exports = {
    MAIN_DIR,
    WORKSPACE_DIR,
    CACHE_PATH,
    OBJECTS_DIR,
    DB_PATH
};
