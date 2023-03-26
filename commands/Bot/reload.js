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

            let embed = new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setAuthor({ name: "Reloading System", iconURL: emb.ownerAvatar })
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })

            let reloadType;
            switch (handler) {
                case "command":
                    reloadCommands(client, cd, embed, interaction);
                    reloadType = "Commands";
                    client.cmdOk = false;
                    break;
                case "event":
                    reloadEvents(client, cd, embed, interaction);
                    reloadType = "Events";
                    client.evtOk = false;
                    break;
                default: {
                    reloadEvents(client, cd, embed, interaction);
                    reloadCommands(client, cd, embed, interaction);
                    reloadType = "Handlers";
                    client.cmdOk = false;
                    client.evtOk = false;
                }
            }

            interaction.reply({
                embeds: [embed
                    .setDescription(`**Reloading ${client.user.username} ${reloadType}${cd ? ` in ${cd} sec${cd != 1 ? "s" : ""}` : "..."}**`)
                ],
                ephemeral: true
            });

            setTimeout(async () => {
                interaction.editReply({
                    embeds: [embed
                        .setAuthor({ name: "Reloaded System", iconURL: emb.ownerAvatar })
                        .setDescription(`**Reloaded ${client.user.username} ${reloadType}** `)
                    ],
                    ephemeral: true
                });
            }, (cd * 1000) + 3000);
        }
    }
} catch (e) { toError(e, null, 0, false) }

/**
 * 
 * @param {*} client Discord client
 * @param {*} cd Cooldown
 * @returns Reload value (1)
 */
async function reloadCommands(client, cd) {
    setTimeout(async () => {
        loadCommands(client);
    }, cd * 1000);
}

/**
 * 
 * @param {*} client Discord client
 * @param {*} cd Cooldown
 * @returns Reload value (2)
 */
async function reloadEvents(client, cd) {
    setTimeout(async () => {
        await client.removeAllListeners();
        // for (const [key, value] of client.events)
        //     client.removeListener(`${key}`, value, true);
        loadEvents(client);
    }, cd * 1000);
}