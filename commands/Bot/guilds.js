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
            await interaction.deferReply({ ephemeral: true });

            let guildlen = client.guilds.cache.size;
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.color)
                    .setAuthor({ name: "SERVERS / GUILDS", iconURL: client.user.displayAvatarURL() })
                    .setDescription(`**${client.user.username}** is currently in **${guildlen}** servers:`)
                ],
                ephemeral: true
            });

            let embedCounter = 1;
            let embed = new EmbedBuilder()
                .setTitle(`Guilds : ${embedCounter}`)
                .setColor(emb.color);
            let fieldCounter = 0;
            client.guilds.cache.forEach((guild) => {
                if (fieldCounter < 25) {
                    embed.addFields({ name: guild.name, value: `||${guild.id}||` });
                    fieldCounter++;
                } else {
                    interaction.followUp({
                        embeds: [embed],
                        ephemeral: true
                    });
                    embedCounter++;
                    embed = new EmbedBuilder()
                        .setTitle(`Guilds : ${embedCounter}`)
                        .setColor(emb.color);
                    fieldCounter = 0;
                }
            });

            if (fieldCounter > 0) {
                interaction.followUp({
                    embeds: [embed],
                    ephemeral: true
                });
            }
        }
    }
} catch (e) { toError(e) }