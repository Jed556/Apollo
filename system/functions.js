// REQUIRE DEPENDENCIES
const { MessageEmbed, Collection } = require('discord.js');
const Discord = require('discord.js')
const emb = require('../config/embed.json');

// Promisify Glob shortcut
 const { promisify } = require('util');
 const { glob } = require('glob');
 const PG = promisify(glob);

// EXPORT ALL FUNCTIONS
module.exports = {
    mainDir,
    reSlash,
    randomNum,
    delay,
    escapeRegex,
    toTitleCase,
    PG
}

// ---------- FUNCTIONS ---------- //

/**
 * @returns Client's root directory
 */
function mainDir() {
    return process.cwd().replace(/\\/g, '/')
}

/**
 * @param {string} string
 * @returns Replaces "\" with "/"
 */
function reSlash(string) {
    return string.replace(/\\/g, '/')
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
        console.log(String(e.stack))
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
            return str
        }
    } catch (e) {
        console.log(String(e.stack))
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