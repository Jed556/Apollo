const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("addend-song")
            .setDescription("Adds current song back to the end of the queue")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/addend-song",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const
                { member, guildId } = interaction,
                { channel } = member.voice;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
            if (validate) return;

            await client.distube.play(channel, newQueue.songs[0].url)
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: "SONG ADDED TO END", iconURL: emb.disc.song.add })
                    .setDescription(`**Song: ${newQueue.songs[newQueue.songs.length - 1].name}**`)
                ],
                ephemeral: true
            });
        }
    }
} catch (e) { toError(e, null, 0, false) }