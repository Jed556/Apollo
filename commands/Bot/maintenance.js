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
            .setName("maintenance")
            .setDescription("Toggles maintenance mode")
            .setDefaultMemberPermissions()
            .setDMPermission(true),
        help: "/maintenance",
        cooldown: 3,
        allowedUIDs: [OwnerID, ...AdminIDs],

        run: async (client, interaction) => {
            await interaction.deferReply();

            // Find matching database data
            const docs = await DB.findOne({
                clientID: client.user.id,
            });

            let maintenance;
            if (docs.maintenance) {
                maintenance = false;
            } else {
                maintenance = true;
            }

            // Store memory usage in database
            await DB.findOneAndUpdate(
                { clientID: client.user.id },
                { maintenance },
                { upsert: true }
            );

            interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "MAINTENANCE", iconURL: client.user.displayAvatarURL() })
                    .setDescription(`**   Status** \`${maintenance ? "ON" : "OFF"}\``)
                ],
                ephemeral: true
            });
        }
    }
} catch (e) { toError(e) }