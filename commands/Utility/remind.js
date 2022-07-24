const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');

module.exports = {
    name: "remind",
    description: "Display mentioned user or command user's information",
    help: "/remind [time] (description)",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "time",
            description: "Remind after x mins",
            type: 4,
            required: true
        },
        {
            name: "description",
            description: "Description of reminder",
            type: 3,
            required: false
        }
    ],

    run: async (client, interaction) => {
        const { member } = interaction;
        const time = interaction.options.getInteger("time");
        const desc = interaction.options.getString("description") || "No Description";

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