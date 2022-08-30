const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unshuffle-queue")
        .setDescription("Unshuffles the queue")
        .setDefaultMemberPermissions()
        .setDMPermission(false),
    help: "/unshuffle-queue",
    cooldown: 2,
    allowedUIDs: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        if (!client.maps.has(`beforeshuffle-${newQueue.id}`)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setAuthor(`NO SONGS SHUFFLED YET`, emb.disc.alert)
                    .setFooter(client.user.username, client.user.displayAvatarURL())
                ],
            });
        }

        newQueue.songs = [newQueue.songs[0], ...client.maps.get(`beforeshuffle-${newQueue.id}`)];
        client.maps.delete(`beforeshuffle-${newQueue.id}`);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: `UNSHUFFELED  ${newQueue.songs.length} SONGS`, iconURL: emb.disc.unshuffle })
            ]
        });
    }
}