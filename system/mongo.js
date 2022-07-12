
const mongoose = require('mongoose');
const { cyanBright, greenBright, yellow, red } = require('chalk');

// Variable checks (Use .env if present)
require('dotenv').config();
let mongoPath, connect;
if (process.env.database && process.env.connectDB) {
    connect = process.env.connectDB;
    mongoPath = process.env.database;
} else {
    const { connectDB, database } = require('../config/database.json');
    connect = connectDB;
    mongoPath = database;
}

// Check if can connect to database
if (!connect)
    return console.log(`${yellow.bold("[WARN]")} Database connection disabled`);
if (!mongoPath)
    return console.log(`${yellow.bold("[WARN]")} MongoDB connection string is null`);

// Connect to database
/**
 * @param {String} dbName Database name
 * @returns mongoose
 */
module.exports.mongo = async function(dbName) {
    await mongoose.connect(mongoPath, {
        dbName,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log(`${cyanBright.bold("[INFO]")} Connected to database!`);
    }).catch((err) => {
        console.log(`${red.bold("[ERROR]")} Can't connect to database \n${err}\n`);
    });
    return mongoose;
}