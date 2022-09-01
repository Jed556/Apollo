const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("stop-song")
            .setDescription("Stops playing and leaves the channel")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/stop-song",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
            if (validate) return;

            if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) {
                await newQueue.stop();
                interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTimestamp()
                        .setColor(emb.color)
                        .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                        .setAuthor({ name: "STOPPED PLAYING", iconURL: emb.disc.stop })
                        .setDescription(`**LEFT THE VOICE CHANNEL**`)
                    ]
                });
            } else {
                await newQueue.stop()
                interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTimestamp()
                        .setColor(emb.color)
                        .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                        .setAuthor({ name: "STOPPED PLAYING", iconURL: emb.disc.stop })
                        .setDescription(`**STOPPED THE PLAYER & LEFT THE VOICE CHANNEL**`)
                    ]
                });
            }
            return;
        }
    }
} catch (e) { toError(e) }