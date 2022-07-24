const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "move-song",
    description: "Moves one Song to another Place",
    help: "/move-song [index] [position]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "index",
            description: "Song index to remove",
            type: 4,
            required: true,
        },
        {
            name: "position",
            description: "Position to move the song (1 == after current, -1 == Top)",
            type: 4,
            required: true,
        }
    ],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId, options } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        let songIndex = options.getInteger("song");
        let position = options.getInteger("where");
        if (position >= newQueue.songs.length || position < 0) position = -1;
        if (songIndex > newQueue.songs.length - 1) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: "SONG DOESN'T EXIST", iconURL: emb.disc.alert })
                .setDescription(`**LAST SONG'S INDEX: ${newQueue.songs.length}**`)
            ],
            ephemeral: true
        });
        if (position == 0) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: "CAN'T MOVE PLAYING SONG", iconURL: emb.disc.alert })
            ],
            ephemeral: true
        });
        let song = newQueue.songs[songIndex];
        //remove the song
        newQueue.songs.splice(songIndex);
        //Add it to a specific Position
        newQueue.addToQueue(song, position);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: "SONG MOVED", iconURL: emb.disc.move })
                .setDescription(`**Moved ${song.name} to index ${position}\n(After ${newQueue.songs[position - 1].name})**`)
            ]
        });
    }
}