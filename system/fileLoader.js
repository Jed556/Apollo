const { PG, mainDir } = require('./functions');

/**
 * 
 * @param {String} dirName Name of directory to load files
 * @returns JavaScript files in directory
 */
async function loadFiles(dirName) {
    const Files = await PG(`${mainDir()}/${dirName}/**/*.js`);
    Files.forEach(file => delete require.cache[require.resolve(file)]);
    return Files
}

module.exports = { loadFiles };