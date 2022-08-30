const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("remind")
            .setDescription("Reminds user when timer finishes")
            .setDefaultMemberPermissions()
            .setDMPermission(true)
            .addIntegerOption(option => option
                .setName("time")
                .setDescription("Remind after x mins")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("description")
                .setDescription("Description of reminder")
                .setRequired(false)
            ),
        help: "/remind [time] (description)",
        cooldown: 2,
        allowedUIDs: [],

        run: async (client, interaction) => {
            const
                { member } = interaction,
                time = interaction.options.getInteger("time"),
                desc = interaction.options.getString("description") || "No Description";

            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.color).setTimestamp()
                    .setAuthor(interaction.user.tag)
                    .setDescription(`**Reminder Set**`)
                    .setFields([
                        { name: "Reminder:", value: desc },
                        { name: "Time:", value: `${time} minutes` }
                    ])
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            });

            // Sec: x * 1000 // Min: x * 1000 * 60 // Hr: Min: x * 1000 * 60 * 60 //
            await new Promise(r => setTimeout(r, time * 1000 * 60));

            interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setColor(emb.color).setTimestamp()
                    .setAuthor({ name: interaction.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`HEY! <@${interaction.user.id}>`)
                    .setFields([
                        { name: "Reminder:", value: desc },
                        { name: "Time:", value: `${time} minutes` }
                    ])
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            });
        }
    }
} catch (e) { }