const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "addrelated-song",
    description: "Adds a similar/related song to the current song",
    help: "/addrelated-song",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(emb.color)
                .setAuthor({ name: "SEARCHING RELATED SONGS", iconURL: emb.disc.spin })
                .setDescription(`For **${newQueue.songs[0].name}**`)
            ],
            ephemeral: true
        });

        await newQueue.addRelatedSong();
        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(emb.okColor)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: "RELATED SONG ADDED TO QUEUE", iconURL: emb.disc.song.add })
                .setDescription(`Song: **${newQueue.songs[newQueue.songs.length - 1].name}**`)
            ],
            ephemeral: true
        });
    }
}