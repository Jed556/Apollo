const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jump-queue")
        .setDescription("Jumps to a specific song in the queue")
        .setDefaultMemberPermissions()
        .setDMPermission(false)
        .addIntegerOption(option => option
            .setName("position")
            .setDescription("Song index to jump to")
            .setRequired(true)
        ),
    help: "/jump-queue [position]",
    cooldown: 2,
    allowedUIDs: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId, options } = interaction;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        let Position = options.getInteger("position")
        if (Position > newQueue.songs.length - 1 || Position < 0) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: "INVALID POSITION", iconURL: emb.disc.alert })
                .setDescription(`**Position must be between 0 and ${newQueue.songs.length - 1}**`)
            ],
            ephemeral: true
        });

        await newQueue.jump(Position);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: "JUMPED TO SONG", iconURL: emb.disc.jump })
                .setDescription(`**Index: ${Position}**`)
            ]
        });
    }
}