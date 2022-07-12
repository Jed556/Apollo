const os = require('os');
const osUtils = require('os-utils');
const ms = require('ms');
const DB = require('../../schemas/Client');
const { mongo } = require('../../system/mongo.js')
const { cyanBright, greenBright, yellow, red } = require('chalk');

// Variable checks (Use .env if present)
require('dotenv').config();
let MemoryShift, MemoryUpdate;
if (process.env.memoryUpdate && process.env.memoryShift) {
    MemoryUpdate = process.env.memoryUpdate;
    MemoryShift = process.env.memoryShift;
} else {
    const { memoryUpdate, memoryShift } = require('../../config/database.json');
    MemoryUpdate = memoryUpdate;
    MemoryShift = memoryShift;
}

// Get the process memory usage (in MB)
async function getMemoryUsage() {
    return process.memoryUsage().heapUsed / (1024 * 1024).toFixed(2);
}

module.exports = async (client) => {
    try {
        await mongo("Client").then(async (mongoose) => {
            try {
                /* ---------- MEMORY LOGGING ---------- */
                let memArray = [];

                setInterval(async () => {
                    memArray.push(await getMemoryUsage()); // Used Memory in GB

                    // Shift array if length is greater than x
                    if (memArray.length > MemoryShift) {
                        memArray.shift();
                    }

                    // Store memory usage in database
                    await DB.findOneAndUpdate(
                        { _id: client.user.id },
                        { Memory: memArray },
                        { upsert: true });

                }, ms(MemoryUpdate + "s")); // Update every x seconds
            } catch (err) {
                console.log(`${red.bold("[ERROR]")} Failed to update database \n${err}\n`);
            }
        })
    } catch (e) {
        console.log(String(e.stack))
    }
}