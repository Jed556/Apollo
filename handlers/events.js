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
    const Table = new AsciiTable3("EVENTS LOADED").setStyle('unicode-single')
        .setAlignCenter(3).setAlignRight(1);
    Table.setHeading("Category", "Type", "Status", "Description");

    await client.events.clear();

    // Require every file ending with .js in the events folder
    const Files = await loadFiles("events")

    Files.forEach((file) => {
        const
            event = require(file),
            L = file.split("/"),
            fileName = L[L.length - 1],
            eventName = fileName.split(".")[0],
            category = L[L.length - 2],
            fileDir = category + `/` + fileName;

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
    client.evtOk = true;
}

module.exports = { loadEvents };