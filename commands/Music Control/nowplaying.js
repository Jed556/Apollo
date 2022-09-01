const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json'),
    emoji = require('../../config/emojis.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("now-playing")
            .setDescription("Displays the current playing song's info")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/grab-song",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId } = interaction,
                { guild } = member,
                { channel } = member.voice;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing"]);
            if (validate) return;

            let newTrack = newQueue.songs[0];
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.color)
                    .setTitle(newTrack.name)
                    .setURL(newTrack.url)
                    .setAuthor({ name: "NOW PLAYING", iconURL: emb.disc.spin })
                    .setFields([
                        { name: `💡 Requested by:`, value: `>>> ${newTrack.user}`, inline: true },
                        { name: `⏱ Duration:`, value: `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``, inline: true },
                        { name: `🌀 Queue:`, value: `>>> \`${newQueue.songs.length} song${newQueue.songs.length != 1 ? "s" : ""}\`\n\`${newQueue.formattedDuration}\``, inline: true },
                        { name: `🔊 Volume:`, value: `>>> \`${newQueue.volume} %\``, inline: true },
                        { name: `♾ Loop:`, value: `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `${emoji.check} \`Queue\`` : `${emoji.check} \`Song\`` : `${emoji.x}`}`, inline: true },
                        { name: `↪️ Autoplay:`, value: `>>> ${newQueue.autoplay ? `${emoji.check}` : `${emoji.x}`}`, inline: true },
                        { name: `⬇ Download Song:`, value: `>>> [\`Music Link\`](${newTrack.streamURL})`, inline: true },
                        { name: `🎙 Filter${newQueue.filters.length > 0 ? "s" : ""}:`, value: `>>> ${newQueue.filters && newQueue.filters.length > 0 ? `${newQueue.filters.map(f => `\`${f}\``).join(`, `)}` : `${emoji.x}`}`, inline: newQueue.filters.length > 1 ? false : true },
                        { name: `<:Youtube:840260133686870036>  View${newTrack.views != 1 ? "s" : ""}:`, value: `>>> \`${newTrack.views}\``, inline: true },
                        { name: `:thumbsup: Like${newTrack.likes != 1 ? "s" : ""}:`, value: `>>> \`${newTrack.likes}\``, inline: true },
                        { name: `:thumbsdown: Dislike${newTrack.dislikes != 1 ? "s" : ""}:`, value: `>>> \`${newTrack.dislikes}\``, inline: true }
                    ])
                    .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
                    .setFooter({ text: `Playing in: ${guild.name}/${channel.name}`, iconURL: guild.iconURL({ dynamic: true }) })
                    .setTimestamp()
                ]
            });
        }
    }
} catch (e) { toError(e) }