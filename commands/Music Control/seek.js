const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("seek-song")
        .setDescription("Jumps to a specific position of the song")
        .setDefaultMemberPermissions()
        .setDMPermission(false)
        .addNumberOption(option => option
            .setName("seconds")
            .setDescription("Position to seek in seconds")
            .setRequired(true)
        ),
    help: "/seek-song [seconds]",
    cooldown: 2,
    allowedUIDs: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId, options } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        let seekNumber = options.getInteger("seconds");
        if (seekNumber > newQueue.songs[0].duration || seekNumber < 0) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: "POSITION EXCEEDS SONG DURATION", iconURL: emb.disc.alert })
                .setDescription(`**Seek position must be between 0 and ${newQueue.songs[0].duration}**`)
            ],
            ephemeral: true
        });

        await newQueue.seek(seekNumber);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: `SEEKED TO ${seekNumber} SECONDS`, iconURL: emb.disc.seek })
            ]
        });
    }
}