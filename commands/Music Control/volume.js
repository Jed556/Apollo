const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("volume-song")
        .setDescription("Adjusts the volume of the music")
        .setDefaultMemberPermissions()
        .setDMPermission(false)
        .addNumberOption(option => option
            .setName("percent")
            .setDescription("Volume to set in percent (0 - 150)")
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(150)
        ),
    help: "/volume-song [percent]",
    cooldown: 2,
    allowedUIDs: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId, options } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "DJ"]);
        if (validate) return;

        let volume = options.getNumber("percent") || Math.round(options.getInteger("percent"));
        let oldVolume = newQueue.volume;

        if (volume == oldVolume) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: `VOLUME IS ALREADY SET TO ${volume}}`, iconURL: emb.disc.alert })
            ],
            ephemeral: true
        });

        await newQueue.setVolume(volume);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: `${(oldVolume < volume) ? "INCREASED" : "DECREASED"} VOLUME TO ${volume}`, iconURL: emb.disc.alert })
            ]
        });
    }
}