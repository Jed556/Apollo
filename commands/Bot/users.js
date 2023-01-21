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

            userlen = client.users.cache.filter(user => !user.bot).size;
            interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.color)
                    .setAuthor({ name: "USERS", iconURL: client.user.displayAvatarURL() })
                    .setDescription(`**${client.user.username}** is currently with **${userlen}** users:`)
                ],
                ephemeral: true
            });

            client.guilds.cache.forEach((guild) => {
                let embedCounter = 1;
                let embed = new EmbedBuilder()
                    .setTitle(`${guild.name} : ${embedCounter}`)
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setColor(emb.color);

                let fieldCounter = 0;
                const nonBotUsers = guild.members.cache.filter(member => !member.user.bot);
                nonBotUsers.forEach((member) => {
                    if (fieldCounter < 25) {
                        embed.addFields({ name: member.user.tag, value: `||${member.user.id}||` });
                        fieldCounter++;
                    } else {
                        interaction.followUp({
                            embeds: [embed],
                            ephemeral: true
                        });
                        embedCounter++;
                        embed = new EmbedBuilder()
                            .setTitle(`${guild.name} : ${embedCounter}`)
                            .setThumbnail(guild.iconURL({ dynamic: true }))
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
            });
        }
    }
} catch (e) { toError(e) }