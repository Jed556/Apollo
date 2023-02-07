
const
    mongoose = require('mongoose'),
    { toLog, toError } = require('./functions');

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
    return toLog("Database connection disabled", 3, false);
if (!mongoPath)
    return toLog("MongoDB connection string variable is null", 3, false);

// Connect to database
/**
 * @param {String} dbName Database name
 * @returns mongoose
 */
module.exports.mongo = async function (dbName) {
    await mongoose.connect(mongoPath, {
        dbName,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        toLog("Connected to database!", 1, false);
    }).catch((err) => {
        toError(err, "Can't connect to database", 0, false);
    });
    return mongoose;
}