const
    { greenBright, red, dim } = require('chalk'),
    { loadFiles } = require('../system/fileLoader.js'),
    { Events } = require('../validation/eventNames'),
    { AsciiTable3 } = require('ascii-table3');

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
        try {
            const event = require(file);
            const execute = (...args) => event.run(client, ...args);
            const target = event.rest ? client.rest : client;

            target[event.once ? "once" : "on"](event.name, execute);
            client.events.set(event.name, execute);

            Table.addRow(category, event.name, greenBright("LOADED"), fileDir);
        } catch (err) {
            Table.addRow(dim(category), dim(event.name), red("ERROR"), `Invalid event name or missing: ${fileDir}`);
        }
    }

    console.log(Table.toString()); // Log table to console
    console.timeEnd("Events Loaded"); // Log time to console
    client.evtOk = true;
}

module.exports = { loadEvents };