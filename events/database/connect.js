const
    { yellow, dim } = require('chalk'),
    { toError, toLog } = require('../../system/functions'),
    cooldownDB = require('../../schemas/Cooldowns'),
    statusDB = require('../../schemas/Status'),
    mongoose = require('mongoose'),
    ms = require('ms');

// Variable checks (Use .env if present)
require('dotenv').config();
let ConnectDB, Database, MemoryShift, UpdateInt;
if (process.env.connectDB && process.env.database && process.env.updateInterval && process.env.memoryShift) {
    ConnectDB = process.env.connectDB
    Database = process.env.database
    UpdateInt = process.env.updateInterval;
    MemoryShift = process.env.memoryShift;
} else {
    const { connectDB, database, updateInterval, memoryShift } = require('../../config/database.json');
    ConnectDB = connectDB;
    Database = database;
    UpdateInt = updateInterval;
    MemoryShift = memoryShift;
}

// Check if can connect to database
if (!ConnectDB)
    return console.log(`${yellow.bold("[WARN]")} Database connection disabled`);
if (!Database)
    return console.log(`${yellow.bold("[WARN]")} MongoDB connection string is null`);

// Get the process memory usage (in MB)
async function getMemoryUsage() {
    return (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
}

module.exports = {
    name: "ready",
    once: true,

    run: async (client) => {
        try {
            await mongoose.connect(Database, {
                dbName: "Client",
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).then(() => {
                toLog("Connected to database", 1, false);
                client.dbOk = true;
            }).catch((err) => {
                console.log(toError(null, "Can't connect to database", null, true) + ` ${dim.bold("(Client)")}` + "\n        " + err.stack.split("\n").map(l => `${l}\n    `).join(""));
            });

            let memArray = []; // Local array for memory

            setInterval(async () => {
                /* ---------- MEMORY UPDATE ---------- */
                memArray.push(await getMemoryUsage()); // Used Memory in GB

                // Shift array if length is greater than x
                if (memArray.length > MemoryShift) {
                    memArray.shift();
                }

                // Store memory usage in database
                await statusDB.findOneAndUpdate(
                    { _id: client.user.id },
                    { memory: memArray },
                    { upsert: true }
                );

                /* --------- COOLDOWN UPDATE --------- */
                await cooldownDB.deleteMany(
                    {
                        time: { $lte: Date.now() }
                    }
                ) // Delete cooldowns in database that already finished
            }, ms(UpdateInt + "s")); // Update every x seconds
        } catch (e) {
            console.log(toError(e, "Database Error"))
        }
    }
}