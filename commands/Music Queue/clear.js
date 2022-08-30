const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("clear-queue")
            .setDescription("Clears the music queue")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/clear-queue",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
            if (validate) return;

            let amount = newQueue.songs.length - 1;
            newQueue.songs = [newQueue.songs[0]];

            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: "CLEARED THE QUEUE", iconURL: emb.disc.clear })
                    .setDescription(`**DELETED ${amount} SONG${amount == 1 ? "" : "S"}**`)
                ]
            });
        }
    }
} catch (e) { }