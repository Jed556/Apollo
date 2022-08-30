const { cyanBright, greenBright, yellow, red, bold, dim } = require('chalk');
const { AsciiTable3 } = require('ascii-table3');
const { toTitleCase } = require('../system/functions');
const { loadFiles } = require('../system/fileLoader');

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

/**
 * 
 * @param {*} client Discord client
 */
async function loadCommands(client) {
    // Create table
    const Table = new AsciiTable3("COMMANDS LOADED").setStyle('unicode-single')
        .setAlignCenter(2).setAlignCenter(3).setAlignCenter(4).setAlignRight(1);
    Table.setHeading("Command", "Cooldown", "Permissions", "Status", "Description");

    commandArray = [];
    await client.commands.clear();

    // Require every file ending with .js in the commands folder
    const Files = await loadFiles("commands");

    Files.forEach(file => {
        let command = require(file);
        const L = file.split("/");
        const fileName = L[L.length - 1];
        const commandName = fileName.split(".")[0];
        const category = L[L.length - 2];
        const fileDir = category + `/` + fileName;
        const cooldown = command.cooldown || DefaultCooldown;

        // Log errors to table
        if (!command.data)
            return Table.addRow(dim(commandName), cooldown, "None", red("FAILED"), "No data < " + fileDir);

        const { name, description, default_member_permissions } = command.data;
        const perms = default_member_permissions //? default_member_permissions.map(p => `${p}`).join(', ') : null;
        const
            upperN = /[A-Z]/.test(name),
            lowerN = /[a-z]/.test(name);

        if (!name)
            return Table.addRow(dim(commandName), cooldown, perms || "None", red("FAILED"), "Missinng name < " + fileDir);

        if (/\s/g.test(name))
            return Table.addRow(dim(name), cooldown, perms || "None", red("FAILED"), "Spaces are not allowed in names < " + fileDir);

        if (upperN || (upperN && lowerN))
            return Table.addRow(dim(name), cooldown, perms || "None", red("FAILED"), "Uppercase characters are not allowed in names < " + fileDir);

        if (!description)
            return Table.addRow(dim(name), cooldown, perms || "None", red("FAILED"), "Missing description < " + fileDir);

        Table.addRow(name, cooldown, perms || "None", greenBright("LOADED"), fileDir);
        // Add the category to description
        command.data.description = `[${toTitleCase(category) || ""}]  ` + description;

        // Push the command to client
        client.commands.set(name, command);
        commandArray.push(command.data.toJSON());
    });

    client.application.commands.set(commandArray); // Load the slash commands
    console.log(Table.toString()); // Log table to console
    return Table.toString();
}

module.exports = { loadCommands };

// function checkPerms(perms) {
//         switch (perms) {
//             case PermissionFlagsBits.AddReactions:
//                 return "AddReactions";
//                 break;

//             case PermissionFlagsBits.Administrator:
//                 return "Administrator";
//                 break;

//             case PermissionFlagsBits.AttachFiles:
//                 return "AttachFiles";
//                 break;

//             case PermissionFlagsBits.BanMembers:
//                 return "BanMembers";
//                 break;

//             case PermissionFlagsBits.ChangeNickname:
//                 return "ChangeNickname";
//                 break;

//             case PermissionFlagsBits.Connect:
//                 return "Connect";
//                 break;

//             case PermissionFlagsBits.CreateInstantInvite:
//                 return "CreateInstantInvite";
//                 break;

//             case PermissionFlagsBits.CreatePrivateThreads:
//                 return "CreatePrivateThreads";
//                 break;

//             case PermissionFlagsBits.CreatePublicThreads:
//                 return "CreatePublicThreads";
//                 break;

//             case PermissionFlagsBits.DeafenMembers:
//                 return "DeafenMembers";
//                 break;

//             case PermissionFlagsBits.EmbedLinks:
//                 return "EmbedLinks";
//                 break;

//             case PermissionFlagsBits.KickMembers:
//                 return "KickMembers";
//                 break;

//             case PermissionFlagsBits.ManageChannels:
//                 return "ManageChannels";
//                 break;

//             case PermissionFlagsBits.ManageEmojisAndStickers:
//                 return "ManageEmojisAndStickers";
//                 break;

//             case PermissionFlagsBits.ManageEvents:
//                 return "ManageEvents";
//                 break;

//             case PermissionFlagsBits.ManageGuild:
//                 return "ManageGuild";
//                 break;

//             case PermissionFlagsBits.ManageMessages:
//                 return "ManageMessages";
//                 break;

//             case PermissionFlagsBits.ManageNicknames:
//                 return "ManageNicknames";
//                 break;

//             case PermissionFlagsBits.ManageRoles:
//                 return "ManageRoles";
//                 break;

//             case PermissionFlagsBits.ManageThreads:
//                 return "ManageThreads";
//                 break;

//             case PermissionFlagsBits.ManageWebhooks:
//                 return "ManageWebhooks";
//                 break;

//             case PermissionFlagsBits.MentionEveryone:
//                 return "MentionEveryone";
//                 break;

//             case PermissionFlagsBits.ModerateMembers:
//                 return "ModerateMembers";
//                 break;

//             case PermissionFlagsBits.MoveMembers:
//                 return "MoveMembers";
//                 break;

//             case PermissionFlagsBits.MuteMembers:
//                 return "MuteMembers";
//                 break;

//             case PermissionFlagsBits.PrioritySpeaker:
//                 return "PrioritySpeaker";
//                 break;

//             case PermissionFlagsBits.ReadMessageHistory:
//                 return "ReadMessageHistory";
//                 break;

//             case PermissionFlagsBits.RequestToSpeak:
//                 return "RequestToSpeak";
//                 break;

//             case PermissionFlagsBits.SendMessages:
//                 return "SendMessages";
//                 break;

//             case PermissionFlagsBits.SendMessagesInThreads:
//                 return "SendMessagesInThreads";
//                 break;

//             case PermissionFlagsBits.SendTTSMessages:
//                 return "SendTTSMessages";
//                 break;

//             case PermissionFlagsBits.Speak:
//                 return "Speak";
//                 break;

//             case PermissionFlagsBits.Stream:
//                 return "Stream";
//                 break;

//             case PermissionFlagsBits.UseApplicationCommands:
//                 return "UseApplicationCommands";
//                 break;

//             case PermissionFlagsBits.UseEmbeddedActivities:
//                 return "UseEmbeddedActivities";
//                 break;

//             case PermissionFlagsBits.UseExternalEmojis:
//                 return "UseExternalEmojis";
//                 break;

//             case PermissionFlagsBits.UseExternalStickers:
//                 return "UseExternalStickers";
//                 break;

//             case PermissionFlagsBits.UseVAD:
//                 return "UseVAD";
//                 break;

//             case PermissionFlagsBits.ViewAuditLog:
//                 return "ViewAuditLog";
//                 break;

//             case PermissionFlagsBits.ViewChannel:
//                 return "ViewChannel";
//                 break;

//             case PermissionFlagsBits.ViewGuildInsights:
//                 return "ViewGuildInsights";
//                 break;
//         }
// }