const { Events } = require('../validation/eventNames');
const { loadFiles } = require('../system/fileLoader.js');
const { cyanBright, greenBright, yellow, red, dim } = require('chalk');
const { AsciiTable3 } = require('ascii-table3');

/**
 * 
 * @param {*} client Discord client
 */
async function loadEvents(client) {
    // Create table
    const Table = new AsciiTable3("EVENTS LOADED").setStyle('unicode-single')
        .setAlignCenter(3).setAlignRight(1);
    Table.setHeading("Category", "Type", "Status", "Description");

    await client.events.clear();

    // Require every file ending with .js in the events folder
    const Files = await loadFiles("events")

    Files.forEach((file) => {
        const event = require(file);
        const L = file.split("/");
        const fileName = L[L.length - 1];
        const eventName = fileName.split(".")[0];
        const category = L[L.length - 2];
        const fileDir = category + `/` + fileName;

        // Log errors to table
        if (!Events.includes(event.name)) {
            Table.addRow(dim(category), dim(event.name), red("MISSING"), `Invalid event name or missing: ${fileDir}`);
            return;
        }

        // Load the events
        const execute = (...args) => event.run(client, ...args);
        client.events.set(event.name, execute);

        if (event.rest) {
            if (event.once) {
                client.rest.once(event.name, execute);
            } else {
                client.rest.on(event.name, execute);
            }
        } else {
            if (event.once) {
                client.once(event.name, execute);
            } else {
                client.on(event.name, execute);
            }
        }

        // Log success to table
        Table.addRow(category, event.name, greenBright("LOADED"), fileDir);
    });


    console.log(Table.toString()); // Log table to console
}

module.exports = { loadEvents };