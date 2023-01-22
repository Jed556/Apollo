const
    { cyanBright, greenBright, yellow, red, bold, dim } = require('chalk'),
    { toTitleCase, toError } = require('../system/functions'),
    { loadFiles } = require('../system/fileLoader'),
    { AsciiTable3 } = require('ascii-table3');

// Variable checks (Use .env if present)
require('dotenv').config();
let Token, GuildID, DefaultCooldown;
if (process.env.token && process.env.guildID && process.env.defaultCooldown) {
    Token = process.env.token;
    GuildID = process.env.guildID;
    DefaultCooldown = process.env.defaultCooldown;
} else {
    const { token, guildID, defaultCooldown } = require('../config/client.json');
    Token = token;
    GuildID = guildID;
    DefaultCooldown = defaultCooldown;
}

/**
 * 
 * @param {*} client Discord client
 */
async function loadCommands(client) {
    // Load commands
    let err = "", check = [];
    await commandHandler(client).catch(e => {
        const
            { stack } = e,
            splitErr = stack.split("\n");

        if (stack.split(" ").includes("InstanceValidator.handle"))
            err = ", Please complete entering command data" + "\n    " + splitErr[6];
        else if (stack.split("\n").includes("Error: Invalid string format"))
            err = ", Please check your capitalization" + "\n    " + splitErr[7];
        else if (stack)
            err = "\n        " + stack.split("\n").map(l => `${l}\n    `).join("");
    })

    // Check the total number of commands
    const Files = await loadFiles("commands");
    Files.forEach((file) => { check.push(file) });

    if (client.commands.size < check.length)
        console.log(toError(null, "Refreshing commands failed") + err);
    else {
        console.log(cyanBright.bold("[INFO]") + " Reloaded commands");
        client.cmdOk = true;
    }
}

/**
 * 
 * @param {*} client Discord client
 */
async function commandHandler(client) {
    // Create table
    const Table = new AsciiTable3("COMMANDS LOADED").setStyle('unicode-single')
        .setAlignCenter(2).setAlignCenter(3).setAlignCenter(4).setAlignRight(1);
    Table.setHeading("Command", "Cooldown", "Permissions", "Status", "Description");

    commandArray = [];
    await client.commands.clear();

    // Require every file ending with .js in the commands folder
    const Files = await loadFiles("commands");

    Files.forEach(file => {
        try {
            let command = require(file);
            const
                L = file.split("/"),
                fileName = L[L.length - 1],
                commandName = fileName.split(".")[0],
                category = L[L.length - 2],
                fileDir = category + `/` + fileName,
                cooldown = command.cooldown || DefaultCooldown;

            // Log errors to table
            if (!command.data)
                return Table.addRow(dim(commandName), cooldown, "None", red("FAILED"), "Invalid data or empty < " + fileDir);

            const { name, description, default_member_permissions } = command.data;
            const perms = default_member_permissions //? default_member_permissions.map(p => `${p}`).join(', ') : null;

            if (!name)
                return Table.addRow(dim(commandName), cooldown, perms || "None", red("FAILED"), "Missinng name < " + fileDir);

            if (!description)
                return Table.addRow(dim(name), cooldown, perms || "None", red("FAILED"), "Missing description < " + fileDir);

            Table.addRow(name, cooldown, perms || "None", greenBright("LOADED"), fileDir);

            // Add the category to description
            command.data.description = `[${toTitleCase(category) || ""}]  ` + description;

            // Push the command to client
            client.commands.set(name, command);
            commandArray.push(command.data.toJSON());
        } catch (e) {
            console.log(toError(e, e.stack.split("\n")[4], 3));
        }
    });

    client.application.commands.set(commandArray).catch(e => { }); // Load the slash commands
    console.log(Table.toString()); // Log table to console
    return Table.toString();
}

module.exports = { loadCommands, commandHandler };