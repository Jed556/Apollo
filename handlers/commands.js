const { Permissions } = require("../validation/permissions");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const chalk = require("chalk")
const {magentaBright, cyanBright, greenBright, yellow, red} = require("chalk");
const { AsciiTable3 } = require("ascii-table3");
const { mainDir } = require(`../system/functions`);
const { token, botID, guildID, loadGlobal } = require("../config/client.json");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

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
            return Table.addRow(fileName, red("FAILED"), "Missinng name");

        if (!command.description)
            return Table.addRow(fileName, red("FAILED"), "Missinng description");

        if (command.permission)
            if (!Permissions.includes(command.permission)) {
                command.defaultpermission = false;
            } else {
                return Table.addRow(fileName, red("FAILED"), "Invalid permission");
            }

        // Push all commands to client
        client.commands.set(command.name, command);
        CommandArray.push(command);

        // Log success to table
        await Table.addRow(command.name, greenBright("LOADED"), L[L.length - 2] + `/` + fileName);
    })

    console.log(Table.toString()); // Log table to console


    // Load the slash commands
    const rest = new REST({ version: "10" }).setToken(token);

    (async () => {
        try {
            console.log(magentaBright("[Discord API]") + " Refreshing commands");
            // Check if will deploy globally
            if (loadGlobal) {
                await rest.put(
                    // Deploys globally
                    Routes.applicationCommands(botID),
                    { body: CommandArray },
                );
            } else {
                await rest.put(
                    // Deploys only in stated guildID
                    Routes.applicationGuildCommands(botID, guildID),
                    { body: CommandArray },
                );
            }
            console.log(magentaBright("[Discord API]") + " Reloaded commands");
        } catch (error) {
            console.error(error);
        }
    })();
}