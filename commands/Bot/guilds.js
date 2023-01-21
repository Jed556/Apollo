const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json'),
    DB = require('../../schemas/Status');

// Variable checks (Use .env if present)
require('dotenv').config();
let OwnerID, AdminIDs = [];
if (process.env.ownerID) {
    OwnerID = process.env.ownerID;
    if (process.env.adminIDs) AdminIDs = process.env.adminIDs.split(', ');
} else {
    const { ownerID, adminIDs } = require('../../config/client.json');
    OwnerID = ownerID;
    AdminIDs = adminIDs;
}

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("guilds")
            .setDescription("Displays the guilds the bot in")
            .setDefaultMemberPermissions()
            .setDMPermission(true),
        help: "/guilds",
        cooldown: 3,
        allowedUIDs: [OwnerID, ...AdminIDs],

        run: async (client, interaction) => {
            await interaction.deferReply();
            let servers = client.guilds.cache.map(guild => guild.name + " ||" + guild.id + "||")

            interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "SERVERS / GUILDS", iconURL: client.user.displayAvatarURL() })
                    .setDescription(`**${client.user.username}** is currently in **${servers.length}** servers: ${servers.join("\n")}`)
                ],
                ephemeral: true
            });
        }
    }
} catch (e) { toError(e) }