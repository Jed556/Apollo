const { Permissions } = require("../validation/permissions");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const chalk = require("chalk")
const dcCol = chalk.bold.hex("#7289da");
const { cyanBright, greenBright, yellow, red, bold } = require("chalk");
const { AsciiTable3 } = require("ascii-table3");
const { mainDir } = require(`../system/functions`);
const { token, botID, guildID, loadGlobal, defaultCooldown } = require("../config/client.json");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports = async (client) => {
    // Create table
    const Table = new AsciiTable3("COMMANDS LOADED").setStyle('unicode-single')
        .setAlignCenter(2).setAlignCenter(4).setAlignRight(1);
    Table.setHeading("Command", "Cooldown", "Permissions", "Status", "Description");

    CommandArray = []; //Array for commands

    // Require every file ending with .js in the commands folder
    (await PG(`${mainDir()}/commands/*/*.js`)).map(async (file) => {
        const command = require(file);
        const L = file.split("/");
        const fileName = L[L.length - 1];
        const perms = command.permissions.map(p => `${p}`).join(', ')
        const cooldown = command.cooldown || defaultCooldown;

        // Log errors to table
        if (!command.name)
            return Table.addRow(fileName, cooldown, perms, red("FAILED"), "Missinng name");

        if (!command.description)
            return Table.addRow(fileName, cooldown, perms, red("FAILED"), "Missinng description");

        if (command.permission)
            if (!Permissions.includes(command.permission)) {
                command.defaultpermission = false;
            } else {
                return Table.addRow(fileName, cooldown, perms, red("FAILED"), "Invalid permission");
            }

        // Push all commands to client
        client.commands.set(command.name, command);
        CommandArray.push(command);

        // Log success to table
        await Table.addRow(command.name, cooldown, perms, greenBright("LOADED"), L[L.length - 2] + `/` + fileName);
    })

    console.log(Table.toString()); // Log table to console


    // Load the slash commands
    const rest = new REST({ version: "10" }).setToken(token);

    (async () => {
        try {
            console.log(dcCol("[REST]") + " Refreshing commands");
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
            console.log(dcCol("[REST]") + " Reloaded commands");
        } catch (error) {
            console.error(error);
        }
    })();
}