const
    { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

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
            await interaction.deferReply({ ephemeral: true });
            let userlen = client.users.cache.filter(user => !user.bot).size;

            // List maker
            client.guilds.cache.forEach((guild) => {
                let
                    embedCounter = 1,
                    embed;

                function newEmbed() {
                    embed = new EmbedBuilder()
                        .setTitle(`${guild.name} : ${embedCounter}`)
                        .setThumbnail(guild.iconURL({ dynamic: true }))
                        .setDescription(`**${client.user.username}** is currently with **${userlen}** users`)
                        .setColor(emb.color);
                }

                newEmbed();
                let fieldCounter = 0;
                const nonBotUsers = guild.members.cache.filter(member => !member.user.bot);
                nonBotUsers.forEach((member) => {
                    if (fieldCounter < 25) {
                        embed.addFields({ name: member.displayName, value: `<@${member.user.id}>#${member.user.discriminator}`, inline: true });
                        fieldCounter++;
                    } else {
                        client.usersEmbedArray.push(embed);
                        embedCounter++;
                        newEmbed();
                        fieldCounter = 0;
                    }
                });

                if (fieldCounter > 0) {
                    client.usersEmbedArray.push(embed);
                }
            });

            // List pagination
            let
                prev = new ButtonBuilder()
                    .setCustomId("prevUserList")
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("⏪"),
                next = new ButtonBuilder()
                    .setCustomId("nextUserList")
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("⏩");

            const control = new ActionRowBuilder().addComponents([prev, next])
            let
                page = 0,
                pagesMax = client.usersEmbedArray.length - 1;

            if (pagesMax == 0) {
                prev.setDisabled();
                next.setDisabled();
            }

            interaction.editReply({
                embeds: [client.usersEmbedArray[page]],
                components: [control],
                ephemeral: true
            });


            let m = await interaction.fetchReply();
            var collector = m.createMessageComponentCollector({
                filter: (i) => i.isButton() && i.user && i.message.author.id == client.user.id,
                time: (10 * 60) * 1000
            });

            collector.on("collect", (button) => {
                button.deferUpdate();
                switch (button.customId) {
                    case "prevUserList":
                        if (page + 1 > pagesMax)
                            page = 0;
                        else
                            ++page;
                        break;
                    case "nextUserList":
                        if (page - 1 < 0)
                            page = pagesMax;
                        else
                            --page;
                        break;
                }
                interaction.editReply({ embeds: [client.usersEmbedArray[page]], components: [control] });
            })

            collector.on("end", (collected, reason) => {
                prev.setDisabled();
                next.setDisabled();
            })
        }
    }
} catch (e) { toError(e) }

