const { Permissions } = require("../validation/permissions");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const chalk = require("chalk");
const { AsciiTable3 } = require("ascii-table3");
const { mainDir } = require(`../system/functions`);

module.exports = async (client) => {
    // Create table
    const Table = new AsciiTable3("COMMANDS LOADED").setStyle('unicode-single');
    Table.setHeading("Command", "Status", "Description");

    CommandArray = []; //Array for commands

    // Require every file ending with .js in the commands folder
    (await PG(`${mainDir()}/commands/*/*.js`)).map(async (file) => {
        const command = require(file);
        const L = file.split("/");
        const fileName = L[L.length - 1];

        // Log errors to table
        if (!command.name)
            return Table.addRow(fileName, "FAILED", "Missinng name");
        if (!command.description)
            return Table.addRow(fileName, "FAILED", "Missinng description");
        if (command.permission)
            if (!Permissions.includes(command.permission)) {
                command.defaultpermission = false;
            } else {
                return Table.addRow(fileName, "FAILED", "Invalid permission");
            }

        // Push all commands to client
        client.commands.set(command.name, command);
        CommandArray.push(command);

        // Log success to table
        await Table.addRow(command.name, chalk.greenBright("LOADED"), L[L.length - 2] + `/` + fileName);
    })

    console.log(Table.toString());


    // ---------- LOAD GLOBALLY ---------- //

    client.on("ready", async () => {
            client.guilds.cache.filter((g) => {
                g.commands.set(CommandArray);
            });
        });
}