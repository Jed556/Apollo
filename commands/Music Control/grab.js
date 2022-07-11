const { MessageEmbed } = require('discord.js');
const emb = require('../../config/embed.json');
const emoji = require('../../config/emojis.json');

module.exports = {
    name: "grab-song",
    description: "Grabs the current song and sends it to your DMs",
    help: "/grab-song",
    cooldown: 1,
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
            member.send({
                embeds: [new MessageEmbed()
                    .setColor(emb.color)
                    .setTitle(newTrack.name)
                    .setURL(newTrack.url)
                    .setAuthor({ name: "SONG PLAYED...", iconURL: emb.disc.grab })
                    .addField(`${(newTrack.user === client.user) ? "💡 Autoplay by:" : "💡 Request by:"}`, `>>> ${newTrack.user}`, true)
                    .addField(`⏱ Duration:`, `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``, true)
                    .addField(`🌀 Queue:`, `>>> \`${newQueue.songs.length} song${newQueue.songs.length != 1 ? "s" : ""}\` - \`${newQueue.formattedDuration}\``, true)
                    .addField(`🔊 Volume:`, `>>> \`${newQueue.volume} %\``, true)
                    .addField(`♾ Loop:`, `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `${emoji.check} \`Queue\`` : `${emoji.check} \`Song\`` : `${emoji.x}`}`, true)
                    .addField(`↪️ Autoplay:`, `>>> ${newQueue.autoplay ? `${emoji.check}` : `${emoji.x}`}`, true)
                    .addField(`⬇ Download:`, `>>> [\`File Link\`](${newTrack.streamURL})`, true)
                    .addField(`🎙 Filter${newQueue.filters.length != 1 ? "s" : ""}:`, `>>> ${newQueue.filters && newQueue.filters.length > 0 ? `${newQueue.filters.map(f => `\`${f}\``).join(`, `)}` : `${emoji.x}`}`, newQueue.filters.length > 2 ? false : true)
                    .addField("\u200b", `\u200b`, true)
                    .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
                    .setFooter({ text: `Played in: ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
                    .setTimestamp()
                ]
            }).then(() => {
                interaction.reply({
                    embeds: [new MessageEmbed()
                        .setTimestamp()
                        .setColor(emb.color)
                        .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                        .setAuthor({ name: "GRABBED! CHECK YOUR DMs", iconURL: emb.disc.grab })
                    ],
                    ephemeral: true
                });
            }).catch(() => {
                interaction.reply({
                    embeds: [new MessageEmbed()
                        .setTimestamp()
                        .setColor(emb.color)
                        .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                        .setAuthor({ name: "I CAN'T DM YOU", iconURL: emb.disc.error })
                    ],
                    ephemeral: true
                });
            })
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