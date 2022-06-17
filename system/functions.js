// REQUIRE DEPENDENCIES
const { MessageEmbed, Collection } = require("discord.js");
const Discord = require("discord.js")
const config = require("../config/client.json");
const emb = require("../config/embed.json");

// EXPORT ALL FUNCTIONS
module.exports.mainDir = mainDir;
module.exports.reSlash = reSlash;
module.exports.randomNum = randomNum;
module.exports.delay = delay;


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
        console.log(String(e.stack).bgRed)
        errDM(client, e)
    }
}