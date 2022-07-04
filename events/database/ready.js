const mongoose = require('mongoose');
const os = require('os');
const osUtils = require('os-utils');
const ms = require('ms');
const DB = require('../../Structures/Schemas/Client');
const { cyanBright, greenBright, yellow, red } = require('chalk');

// Variable checks (Use .env if present)
require('dotenv').config();
let Database, ConnectDB, MemoryUpdate
if (process.env.database && process.env.connectDB && process.env.memoryUpdate && process.env.memoryShift) {
    Database = process.env.database;
    ConnectDB = process.env.connectDB;
    MemoryUpdate = process.env.memoryUpdate;
    MemoryShift = process.env.memoryShift;
} else {
    const { connectDB, database, memoryUpdate, memoryShift } = require('../../config/database.json');
    Database = database;
    ConnectDB = connectDB;
    MemoryUpdate = memoryUpdate;
    MemoryShift = memoryShift;
}

// Get the process memory usage (in MB)
async function getMemoryUsage() {
    return process.memoryUsage().heapUsed / (1024 * 1024).toFixed(2);
}

module.exports = async (client) => {
    try {
        // Check if can connect to database
        if (!ConnectDB)
            return console.log(`${yellow.bold("[WARN]")} Database connection disabled`);
        if (!Database) return console.log(`${yellow.bold("[WARN]")} MongoDB connection string is null`);

        // Connecting to database
        mongoose.connect(Database, {
            dbName: "Client",
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log(`${cyanBright.bold("[INFO]")} Connected to database!`);
        }).catch((err) => {
            console.log(`${red.bold("[ERROR]")} Can't connect to database \n${err}\n`);
        });

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
                { Client: true },
                { Memory: memArray },
                { upsert: true });

        }, ms(MemoryUpdate + "s")); // Update every x seconds

    } catch (e) {
        console.log(String(e.stack))
    }
}