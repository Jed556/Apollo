const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autoplay-song")
        .setDescription("Plays a song related to current track after it finishes (Toggles autoplay)")
        .setDefaultMemberPermissions()
        .setDMPermission(false),
    help: "/autoplay-song",
    cooldown: 2,
    allowedUIDs: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId } = interaction;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        await newQueue.toggleAutoplay();
        if (newQueue.autoplay) {
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: "ENABLED AUTOPLAY", iconURL: emb.disc.autoplay.on })
                ]
            });
        } else {
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: "DISABLED AUTOPLAY", iconURL: emb.disc.autoplay.off })
                ]
            });
        }
    }
}