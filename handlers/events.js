const { Events } = require(`../validation/eventNames`);
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const { cyanBright, greenBright, yellow, red } = require("chalk");
const { AsciiTable3 } = require("ascii-table3");
const { mainDir } = require(`../system/functions`);

module.exports = async (client) => {
    // Create table
    const Table = new AsciiTable3("EVENTS LOADED").setStyle('unicode-single');
    Table.setHeading("Event", "Status", "Description");

    // Require every file ending with .js in the events folder
    (await PG(`${mainDir()}/events/*/*.js`)).map(async (file) => {
        const event = require(file);
        const L = file.split("/");
        const fileName = L[L.length - 1];
        const eventName = fileName.split(".")[0]
        const fileDir = L[L.length - 2] + `/` + fileName;

        // Log errors to table
        if (!Events.includes(eventName)) {
            await Table.addRow(eventName, red("MISSING"), `Invalid event name or missing: ${fileDir}`);
            return;
        }

        // Load the events
        if (event.once) {
            client.once(eventName, event.bind(null, client));
        } else {
            client.on(eventName, event.bind(null, client));
        }

        // Log success to table
        await Table.addRow(eventName, greenBright("LOADED"), fileDir);
    });

    console.log(Table.toString()); // Log table to console
}