const
    { greenBright, red, dim } = require('chalk'),
    { loadFiles } = require('../system/fileLoader.js'),
    { Events } = require('../validation/eventNames'),
    { AsciiTable3 } = require('ascii-table3'),
    path = require('path');

/**
 * 
 * @param {*} client Discord client
 */
async function loadEvents(client) {
    // Create table
    console.time("Events Loaded");

    const Table = new AsciiTable3("EVENTS LOADED").setStyle('unicode-single')
        .setAlignCenter(3).setAlignRight(1);
    Table.setHeading("Category", "Type", "Status", "Description");

    client.events = new Map();
    const events = new Array();

    // Require every file ending with .js in the events folder
    const Files = await loadFiles("events")

    for (const file of Files) {
        const // Setup naming variables
            L = file.split(path.sep),
            fileName = L[L.length - 1],
            eventName = fileName.split(".")[0],
            category = L[L.length - 2],
            fileDir = category + `/` + fileName;

        try {
            const event = require(file);

            // Check if event is valid
            if (!Events.includes(event.name)) {
                Table.addRow(dim(category), dim(event.name), red("MISSING"), `Invalid event name or missing: ${fileDir}`);
                continue;
            }

            // Setup execution
            const execute = (...args) => event.run(client, ...args);
            const target = event.rest ? client.rest : client;

            // Run event
            target[event.once ? "once" : "on"](event.name, execute);
            client.events.set(event.name, execute);

            // Log event
            Table.addRow(category, event.name, greenBright("LOADED"), fileDir);
        } catch (err) {
            // Log error
            const event = require(file);
            Table.addRow(dim(category), dim(event.name), red("ERROR"), `Run error: ${fileDir}`);
        }
    }

    console.log(Table.toString()); // Log table to console
    console.timeEnd("Events Loaded"); // Log time to console
    client.evtOk = true;
}

module.exports = { loadEvents };