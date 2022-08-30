const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove-song")
        .setDescription("Removes song(s)")
        .setDefaultMemberPermissions()
        .setDMPermission(false)
        .addNumberOption(option => option
            .setName("song")
            .setDescription("Song index to remove")
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setName("amount")
            .setDescription("Number of songs to remove from given index (Default: 1)")
            .setRequired(true)
        ),
    help: "/remove-song [song] (amount)",
    cooldown: 2,
    allowedUIDs: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId, options } = interaction;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        let songIndex = options.getInteger("song");
        let amount = options.getInteger("amount");
        if (!amount) amount = 1;
        if (songIndex > newQueue.songs.length - 1) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: "SONG INDEX DOESN'T EXIST", iconURL: emb.disc.alert })
            ],
            ephemeral: true
        });

        if (songIndex <= 0) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: "SONG IS CURRENTLY PLAYING", iconURL: emb.disc.alert })
                .setDescription(`**You can't remove the currently playing song (0) \n Use the \`skip\` Slash Command instead!**`)
            ],
            ephemeral: true
        });

        if (amount <= 0) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: "REMOVE AT LEAST 1 SONG", iconURL: emb.disc.alert })
            ],
            ephemeral: true
        });

        newQueue.songs.splice(songIndex, amount);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: `REMOVED ${amount} SONG${amount == 1 ? "S" : ""} FROM QUEUE`, iconURL: emb.disc.song.remove })
            ]
        });
    }
}