const
    { toError, mainDir } = require('./functions'),
    { glob } = require('glob'),
    path = require('path');

/**
 * 
 * @param {String} dirName Name of directory to load files
 * @returns JavaScript files in directory
 */
async function loadFiles(dirName) {
    try {
        const files = await glob(path.join(process.cwd(), dirName, "**/*.js").replace(/\\/g, "/"));
        const jsFiles = files.filter(file => path.extname(file) === ".js");
        await Promise.all(jsFiles.map(deleteCachedFile));
        return jsFiles;
    } catch (err) {
        toError(err, `Error loading files from ${dirName}: ${err}`, 0, false);
    }
}

/**
 * 
 * @param {*} file File to delete in cache
 */
async function deleteCachedFile(file) {
    const filePath = path.resolve(file);
    if (require.cache[filePath]) delete require.cache[filePath];
}

module.exports = { loadFiles };