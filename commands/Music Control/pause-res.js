const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("pause-resume")
            .setDescription("Toggles between pause and resume")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/pause-resume",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId } = interaction
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing"]);
            if (validate) return;

            if (newQueue.playing) {
                await newQueue.pause(); // Pause the music
                interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTimestamp()
                        .setColor(emb.color)
                        .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                        .setAuthor({ name: "MUSIC PAUSED", iconURL: emb.disc.pause })
                    ]
                });
            } else {
                await newQueue.resume(); // Resume the music
                interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTimestamp()
                        .setColor(emb.color)
                        .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                        .setAuthor({ name: "MUSIC RESUMED", iconURL: emb.disc.resume })
                    ]
                });
            }
        }
    }
} catch (e) { toError(e) }