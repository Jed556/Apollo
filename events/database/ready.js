const mongoose = require('mongoose');
const os = require('os');
const osUtils = require('os-utils');
const ms = require('ms');
const DB = require('../../schemas/Client');
const { cyanBright, greenBright, yellow, red, dim } = require('chalk');

// Variable checks (Use .env if present)
require('dotenv').config();
let ConnectDB, Database, MemoryShift, MemoryUpdate;
if (process.env.memoryUpdate && process.env.memoryShift) {
    ConnectDB = process.env.connectDB
    Database = process.env.database
    MemoryUpdate = process.env.memoryUpdate;
    MemoryShift = process.env.memoryShift;
} else {
    const { connectDB, database, memoryUpdate, memoryShift } = require('../../config/database.json');
    ConnectDB = connectDB;
    Database = database;
    MemoryUpdate = memoryUpdate;
    MemoryShift = memoryShift;
}

// Check if can connect to database
if (!ConnectDB)
    return console.log(`${yellow.bold("[WARN]")} Database connection disabled`);
if (!Database)
    return console.log(`${yellow.bold("[WARN]")} MongoDB connection string is null`);

// Get the process memory usage (in MB)
async function getMemoryUsage() {
    return process.memoryUsage().heapUsed / (1024 * 1024).toFixed(2);
}

module.exports = async (client) => {
    try {
        await mongoose.connect(Database, {
            dbName: "Client",
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            // console.log(`${cyanBright.bold("[INFO]")} Connected to database ` + dim.bold(`(${dbName})`));
        }).catch((err) => {
            console.log(`${red.bold("[ERROR]")} Can't connect to database ${dim.bold("(Client)")}\n${err}\n`);
        });

        setInterval(async () => {
            /* ---------- MEMORY LOGGING ---------- */
            let memArray = [];

            memArray.push(await getMemoryUsage()); // Used Memory in GB

            // Shift array if length is greater than x
            if (memArray.length > MemoryShift) {
                memArray.shift();
            }

            // Store memory usage in database
            await DB.findOneAndUpdate(
                { _id: client.user.id },
                { memory: memArray },
                { upsert: true });
        }, ms(MemoryUpdate + "s")); // Update every x seconds
    } catch (e) {
        console.log(String(e.stack))
    }
}