const { MessageEmbed } = require('discord.js');
const emb = require('../../config/embed.json');
const DB = require('../../schemas/Status');

// Variable checks (Use .env if present)
require('dotenv').config();
let OwnerID, AdminIDs;
if (process.env.ownerID) {
    OwnerID = process.env.ownerID;
    AdminIDs = process.env.adminIDs.split(', ') || null;
} else {
    const { ownerID, adminIDs } = require('../../config/client.json');
    OwnerID = ownerID;
    AdminIDs = adminIDs;
}

module.exports = {
    name: "maintenance",
    description: "Toggles maintenance mode",
    help: "/maintenance",
    cooldown: 3,
    permissions: [],
    allowedUIDs: [OwnerID, ...AdminIDs],
    options: [],

    run: async (client, interaction) => {
        try {
            // Find matching database data
            const docs = await DB.findOne({
                _id: client.user.id,
            });

            let maintenance;
            if (docs.maintenance) {
                maintenance = false;
            } else {
                maintenance = true;
            }

            // Store memory usage in database
            await DB.findOneAndUpdate(
                { _id: client.user.id },
                { maintenance },
                { upsert: true }
            );

            interaction.reply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "MAINTENANCE", iconURL: client.user.displayAvatarURL() })
                    .setDescription(`**   Status** \`${maintenance ? "ON" : "OFF"}\``)
                ],
                ephemeral: true
            })
        } catch (e) {
            console.log(String(e.stack))
        }
    }
}