const { MessageEmbed } = require('discord.js');
const emb = require('../../config/embed.json');
const emoji = require('../../config/emojis.json');

module.exports = {
    name: "now-playing",
    description: "Displays the current playing song's info",
    help: "/now-playing",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [],

    run: async (client, interaction) => {
        try {
            const { member, guildId } = interaction;
            const { guild } = member;
            const { channel } = member.voice;
            let newQueue = client.distube.getQueue(guildId);

            if (!newQueue || !newQueue.songs || newQueue.songs.length == 0)
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "NOTHING PLAYING YET", iconURL: emb.disc.alert })
                    ],
                    ephemeral: true
                });

            if (!channel) {
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "JOIN A VOICE CHANNEL FIRST", iconURL: emb.disc.alert })
                    ],
                    ephemeral: true
                });
            } else if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id)
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "JOIN MY VOICE CHANNEL FIRST", iconURL: emb.disc.alert })
                        .setDescription(`**Channel: <#${channel.guild.me.voice.channel.id}>**`)
                    ],
                    ephemeral: true
                });

            if (channel.userLimit != 0 && channel.full && !channel)
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "YOUR VOICE CHANNEL IS FULL", iconURL: emb.disc.alert })
                    ],
                    ephemeral: true
                });

            let newTrack = newQueue.songs[0];
            interaction.reply({
                embeds: [new MessageEmbed()
                    .setColor(emb.color)
                    .setTitle(newTrack.name)
                    .setURL(newTrack.url)
                    .setAuthor({ name: "NOW PLAYING", iconURL: emb.disc.spin })
                    .addField(`💡 Requested by:`, `>>> ${newTrack.user}`, true)
                    .addField(`⏱ Duration:`, `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``, true)
                    .addField(`🌀 Queue:`, `>>> \`${newQueue.songs.length} song${newQueue.songs.length != 1 ? "s" : ""}\`\n\`${newQueue.formattedDuration}\``, true)
                    .addField(`🔊 Volume:`, `>>> \`${newQueue.volume} %\``, true)
                    .addField(`♾ Loop:`, `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `${emoji.check} \`Queue\`` : `${emoji.check} \`Song\`` : `${emoji.x}`}`, true)
                    .addField(`↪️ Autoplay:`, `>>> ${newQueue.autoplay ? `${emoji.check}` : `${emoji.x}`}`, true)
                    .addField(`⬇ Download Song:`, `>>> [\`Music Link\`](${newTrack.streamURL})`, true)
                    .addField(`🎙 Filter${newQueue.filters.length > 0 ? "s" : ""}:`, `>>> ${newQueue.filters && newQueue.filters.length > 0 ? `${newQueue.filters.map(f => `\`${f}\``).join(`, `)}` : `${emoji.x}`}`, newQueue.filters.length > 1 ? false : true)
                    .addField(`<:Youtube:840260133686870036>  View${newTrack.views != 1 ? "s" : ""}:`, `>>> \`${newTrack.views}\``, true)
                    .addField(`:thumbsup: Like${newTrack.likes != 1 ? "s" : ""}:`, `>>> \`${newTrack.likes}\``, true)
                    .addField(`:thumbsdown: Dislike${newTrack.dislikes != 1 ? "s" : ""}:`, `>>> \`${newTrack.dislikes}\``, true)
                    .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
                    .setFooter({ text: `Playing in: ${guild.name}/${channel.name}`, iconURL: guild.iconURL({ dynamic: true }) })
                    .setTimestamp()
                ]
            });
        } catch (e) {
            console.log(e.stack ? e.stack : e);
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "AN ERROR OCCURED", iconURL: emb.disc.error })
                    .setDescription(`\`/info support\` for support or DM me \`${client.user.tag}\` \`\`\`${e}\`\`\``)
                ],
                ephemeral: true
            });
        }
    }
}