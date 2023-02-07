const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("addrelated-song")
            .setDescription("Adds a similar/related song to the current song")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/addrelated-song",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId } = interaction;
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
} catch (e) { toError(e, null, 0, false) }