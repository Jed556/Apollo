const { Permissions } = require('../validation/permissions');
const chalk = require('chalk')
const blurple = chalk.bold.hex("#7289da");
const { cyanBright, greenBright, yellow, red, bold, dim } = require('chalk');
const { AsciiTable3 } = require('ascii-table3');
const { mainDir, PG, toTitleCase } = require('../system/functions');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

// Variable checks (Use .env if present)
require('dotenv').config();
let Token, BotID, GuildID, LoadGlobal, DefaultCooldown;
if (process.env.token && process.env.guildID && process.env.botID && process.env.loadGlobal && process.env.defaultCooldown) {
    Token = process.env.token;
    BotID = process.env.botID;
    GuildID = process.env.guildID;
    LoadGlobal = process.env.loadGlobal;
    DefaultCooldown = process.env.defaultCooldown;
} else {
    const { token, botID, guildID, loadGlobal, defaultCooldown } = require('../config/client.json');
    Token = token;
    BotID = botID;
    GuildID = guildID;
    LoadGlobal = loadGlobal;
    DefaultCooldown = defaultCooldown;

}


module.exports = async (client) => {
    // Create table
    const Table = new AsciiTable3("COMMANDS LOADED").setStyle('unicode-single')
        .setAlignCenter(2).setAlignCenter(3).setAlignCenter(4).setAlignRight(1);
    Table.setHeading("Command", "Cooldown", "Permissions", "Status", "Description");

    CommandArray = []; //Array for commands

    // Require every file ending with .js in the commands folder
    (await PG(`${mainDir()}/commands/*/*.js`)).map(async file => {
        let command = require(file);
        const L = file.split("/");
        const fileName = L[L.length - 1];
        const perms = command.permissions ? command.permissions.map(p => `${p}`).join(', ') : null;
        const cooldown = command.cooldown || DefaultCooldown;

        // Log errors to table
        if (!command.name)
            return Table.addRow(dim(fileName), cooldown, perms || "None", red("FAILED"), "Missinng name");

        if (!command.description)
            return Table.addRow(dim(fileName), cooldown, perms || "None", red("FAILED"), "Missinng description");

        if (command.permission)
            if (!Permissions.includes(command.permission)) {
                command.defaultpermission = false;
            } else {
                return Table.addRow(dim(fileName), cooldown, perms || "None", red("FAILED"), "Invalid permission");
            }

        // Add the category to description
        command.description = `Category: ${toTitleCase(L[L.length - 2]) || "None"} | ` + command.description;

        // Push all commands to client
        client.commands.set(command.name, command);
        CommandArray.push(command);

        // Log success to table
        await Table.addRow(command.name, cooldown, perms || "None", greenBright("LOADED"), L[L.length - 2] + `/` + fileName);
    })

    console.log(Table.toString()); // Log table to console


    // Load the slash commands
    const rest = new REST({ version: "10" }).setToken(Token);

    (async () => {
        try {
            console.log(blurple("[REST]") + " Refreshing commands");
            // Check if will deploy globally
            if (LoadGlobal) {
                await rest.put(
                    // Deploys globally
                    Routes.applicationCommands(BotID),
                    { body: CommandArray },
                );
            } else {
                await rest.put(
                    // Deploys only in stated guildID
                    Routes.applicationGuildCommands(BotID, GuildID),
                    { body: CommandArray },
                );
            }
            console.log(blurple("[REST]") + " Reloaded commands");
        } catch (error) {
            console.log(red.bold("[ERROR]") + " Refreshing commands failed");
            console.error(error);
        }
    })();
}