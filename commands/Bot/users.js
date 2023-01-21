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
            .setName("users")
            .setDescription("Displays the users the bot is with")
            .setDefaultMemberPermissions()
            .setDMPermission(true),
        help: "/users",
        cooldown: 3,
        allowedUIDs: [OwnerID, ...AdminIDs],

        run: async (client, interaction) => {
            await interaction.deferReply();
            let users = client.users.cache.map(user => user.tag + " ||" + user.id + "||")

            interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "SERVERS / GUILDS", iconURL: client.user.displayAvatarURL() })
                    .setDescription(`**${client.user.username}** is currently with **${users.length}** users: ${users.join("\n")}`)
                ],
                ephemeral: true
            });
        }
    }
} catch (e) { toError(e) }