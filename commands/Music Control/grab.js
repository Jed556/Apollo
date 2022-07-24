const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const emoji = require('../../config/emojis.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "grab-song",
    description: "Grabs the current song and sends it to your DMs",
    help: "/grab-song",
    cooldown: 1,
    permissions: [],
    allowedUIDs: [],
    options: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId } = interaction;
        const { guild } = member;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing"]);
        if (validate) return;

        let newTrack = newQueue.songs[0];
        member.send({
            embeds: [new EmbedBuilder()
                .setColor(emb.color)
                .setTitle(newTrack.name)
                .setURL(newTrack.url)
                .setAuthor({ name: "SONG PLAYED...", iconURL: emb.disc.grab })
                .setFields([
                    { name: `${(newTrack.user === client.user) ? "💡 Autoplay by:" : "💡 Request by:"}`, value: `>>> ${newTrack.user}`, inline: true },
                    { name: `⏱ Duration:`, value: `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``, inline: true },
                    { name: `🌀 Queue:`, value: `>>> \`${newQueue.songs.length} song${newQueue.songs.length != 1 ? "s" : ""}\` - \`${newQueue.formattedDuration}\``, inline: true },
                    { name: `🔊 Volume:`, value: `>>> \`${newQueue.volume} %\``, inline: true },
                    { name: `♾ Loop:`, value: `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `${emoji.check} \`Queue\`` : `${emoji.check} \`Song\`` : `${emoji.x}`}`, inline: true },
                    { name: `↪️ Autoplay:`, value: `>>> ${newQueue.autoplay ? `${emoji.check}` : `${emoji.x}`}`, inline: true },
                    { name: `⬇ Download:`, value: `>>> [\`File Link\`](${newTrack.streamURL})`, inline: true },
                    { name: `🎙 Filter${newQueue.filters.length != 1 ? "s" : ""}:`, value: `>>> ${newQueue.filters && newQueue.filters.length > 0 ? `${newQueue.filters.map(f => `\`${f}\``).join(`, `)}` : `${emoji.x}`}`, inline: newQueue.filters.length > 2 ? false : true },
                    { name: "\u200b", value: `\u200b`, inline: true }
                ])
                .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
                .setFooter({ text: `Played in: ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
                .setTimestamp()
            ]
        }).then(() => {
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: "GRABBED! CHECK YOUR DMs", iconURL: emb.disc.grab })
                ],
                ephemeral: true
            });
        }).catch(() => {
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: "I CAN'T DM YOU", iconURL: emb.disc.error })
                ],
                ephemeral: true
            });
        })
    }
}