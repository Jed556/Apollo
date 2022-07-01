const mongoose = require('mongoose');
const os = require('os');
const osUtils = require('os-utils');
const ms = require('ms');
const DB = require('../../Structures/Schemas/Client');
const { cyanBright, greenBright, yellow, red } = require('chalk');

// Variable checks (Use .env if present)
require('dotenv').config();
let Database, ConnectDB, MemoryUpdate
if (process.env.database) {
    Database = process.env.database;
    ConnectDB = process.env.connectDB;
    MemoryUpdate = process.env.memoryUpdate;
} else {
    const { connectDB, database, memoryUpdate } = require('../../config/database.json');
    Database = database;
    ConnectDB = connectDB;
    MemoryUpdate = memoryUpdate;
}

/* ----------[RAM Usage]---------- */

// Get the process memory usage (in MB)
async function getMemoryUsage() {
    return process.memoryUsage().heapUsed / (1024 * 1024).toFixed(2);
}

module.exports = async (client) => {
    try {
        /* ---------- CONNECTING TO DATABASE ---------- */
        if (ConnectDB) {
            if (!Database) return;
            mongoose.connect(Database, {
                dbName: "Client",
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).then(() => {
                console.log(`${cyanBright.bold("[INFO]")} Connected to database!`);
            }).catch((err) => {
                console.log(`${red.bold("[ERROR]")} Not connected to database \n${err}\n`);
            });
        } else {
            console.log(`${yellow.bold("[WARN]")} Database connection disabled`);


            /* ---------- MEMORY LOGGING ---------- */
            let memArray = [];

            setInterval(async () => {

                // Used Memory in GB
                memArray.push(await getMemoryUsage());

                if (memArray.length >= 100) {
                    memArray.shift();
                }

                // Store memory usage date in database
                await DB.findOneAndUpdate(
                    { Client: true },
                    { Memory: memArray },
                    { upsert: true });

            }, ms(MemoryUpdate + "s")); // Update every x seconds
        }
    } catch (e) {
        console.log(String(e.stack))
    }
}