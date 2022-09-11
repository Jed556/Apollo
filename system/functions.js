// REQUIRE DEPENDENCIES
const
    { cyanBright, greenBright, yellow, red, dim } = require('chalk'),
    { promisify } = require('util'),
    { glob } = require('glob');

// ---------- FUNCTIONS ---------- //

/**
 * 
 * @returns promisify(glob) shortcut
 */
const PG = promisify(glob);

/**
 * 
 * @returns Client's root directory
 */
function mainDir() {
    return reSlash(process.cwd());
}

/**
 * 
 * @param {string} string
 * @returns Replaces "\" with "/"
 */
function reSlash(string) {
    return string.replace(/\\/g, '/');
}

/**
 * 
 * @param {*} min Number | Minimum number
 * @param {*} max Number | Maximum number
 * @returns Random number
 */
function randomNum(min, max) {
    try {
        let number;
        if (min && max) {
            number = Math.round(Math.random() * (max - min)) + min;
        } else {
            number = Math.round(Math.random());
        }
        return number;
    } catch (e) { }
}

/**
 * 
 * @param {*} delayInms Number | Time in Milliseconds
 * @returns Promise, waiting for the given Milliseconds
 */
function delay(delayInms) {
    try {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(2);
            }, delayInms);
        });
    } catch (e) {
        console.log(toError(e));
    }
}

/**
 * 
 * @param {*} str String
 * @returns Formatted string
 */
function escapeRegex(str) {
    try {
        try {
            return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
        } catch {
            return str;
        }
    } catch (e) {
        console.log(toError(e));
    }
}

/**
 * 
 * @param {*} str String
 * @returns String in title case
 */
function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

/**
 * 
 * @param {*} error Thrown error
 * @param {String} message Message to display before the error
 * @param {Number} lines Number of lines to display
 * @returns Formatted console error string
 */
function toError(error, message, lines) {
    const
        alert = red.bold("[ERROR] "),
        err = error ? error.stack ? error.stack : error : "";

    if (message && lines && err)
        return alert + message + err.split("\n", lines).map(l => `\n        ${l}`).join("");
    else if (message && err)
        return alert + message + err.split("\n").map(l => `\n        ${l}`).join("");
    else if (lines && err)
        return alert + err.split("\n", lines).map(l => `${l}\n        `).join("");
    else if (err)
        return alert + err.split("\n", lines).map(l => `${l}\n        `).join("");
    else if (message)
        return alert + message;
    else return alert + "Unknown Error";
}

// EXPORT ALL FUNCTIONS
module.exports = {
    mainDir,
    reSlash,
    randomNum,
    delay,
    escapeRegex,
    toTitleCase,
    toError,
    PG
}