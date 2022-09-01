const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { loadCommands } = require('../../handlers/commands'),
    { loadEvents } = require('../../handlers/events'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json'),
    chalk = require('chalk'),
    blurple = chalk.bold.hex("#7289da");

// Variable checks (Use .env if present)
require('dotenv').config();
let OwnerID;
if (process.env.ownerID) {
    OwnerID = process.env.ownerID;
} else {
    const { ownerID } = require('../../config/client.json');
    OwnerID = ownerID;
}

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("reload")
            .setDescription("Perform Apollø global reload")
            .setDefaultMemberPermissions()
            .setDMPermission(true)
            .addStringOption(option => option
                .setName("system")
                .setDescription("System handler to reload")
                .setRequired(false)
                .addChoices(
                    { name: "commands", value: "command" },
                    { name: "events", value: "event" },
                )
            )
            .addIntegerOption(option => option
                .setName("countdown")
                .setDescription("Countdown before restarting (seconds)")
                .setRequired(false)
            ),
        help: "/reload (handler) (countdown)",
        cooldown: 10,
        allowedUIDs: [OwnerID],

        run: async (client, interaction) => {
            const
                cd = interaction.options.getInteger("countdown") || 0,
                handler = interaction.options.getString("system");

            let reloaded = [], reloadType;
            switch (handler) {
                case "command":
                    reloaded.push(reloadCommands(client, cd));
                    break;
                case "event":
                    reloaded.push(reloadEvents(client, cd));
                    break;
                default: {
                    reloaded.push(reloadEvents(client, cd));
                    reloaded.push(reloadCommands(client, cd));
                }
            }


            sum = reloaded.reduce((pv, cv) => pv + cv, 0);
            if (sum == 1)
                reloadType = "Commands";
            else if (sum == 2)
                reloadType = "Events";
            else
                reloadType = "Handlers";

            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setAuthor({ name: "Reloading System", iconURL: emb.ownerAvatar })
                    .setDescription(`**Reloading ${client.user.username} ${reloadType}${cd ? ` in ${cd} sec${cd != 1 ? "s" : ""}` : "..."}**`)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            });
        }
    }
} catch (e) { toError(e) }

/**
 * 
 * @param {*} client Discord client
 * @returns Reload value (1)
 */
async function reloadCommands(client, cd) {
    setTimeout(async () => {
        loadCommands(client);
    }, cd * 1000);
    return 1;
}

/**
 * 
 * @param {*} client Discord client
 * @returns Reload value (2)
 */
async function reloadEvents(client, cd) {
    setTimeout(async () => {
        for (const [key, value] of client.events)
            client.removeListener(`${key}`, value, true);
        loadEvents(client);
    }, cd * 1000);
    return 2;
}