const { Events } = require(`../validation/eventNames`);
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const chalk = require("chalk");
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
        const fileDir = L[L.length - 2] + `/` + L[L.length - 1];

        // Log errors to table
        if (!Events.includes(event.name) || !event.name) {
            await Table.addRow(`${event.name || chalk.red("MISSING")}`, `Invalid event name or missing: ${fileDir}`);
            return;
        }

        // Load the events
        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }

        // Log success to table
        await Table.addRow(event.name, chalk.greenBright("LOADED"), fileDir);
    });

    console.log(Table.toString());
}