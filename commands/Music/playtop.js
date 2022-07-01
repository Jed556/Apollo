const { MessageEmbed } = require('discord.js');
const emb = require('../../config/embed.json');
const { check_if_dj } = require('../../system/distubeFunctions');

module.exports = {
    name: "playtop",
    description: "Plays a song/playlist and adds it to the top",
    help: "/playtop [song]",
    cooldown: 2,
    permissions: [],
    options: [
        {
            name: "song",
            description: "Song to play",
            type: 3,
            required: true,
        }
    ],

    run: async (client, interaction) => {
        try {
            const { member, channelId, guildId, options } = interaction;
            const { guild } = member;
            const { channel } = member.voice;
            let newQueue = client.distube.getQueue(guildId);

            if (!channel) {
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "JOIN A VOICE CHANNEL FIRST", iconURL: emb.disc.alert })
                    ],
                    ephemeral: true
                })
            } else if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id)
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "JOIN MY VOICE CHANNEL FIRST", iconURL: emb.disc.alert })
                        .setDescription(`**Channel: <#${channel.guild.me.voice.channel.id}>**`)
                    ],
                    ephemeral: true
                })

            if (channel.userLimit != 0 && channel.full && !channel)
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "YOUR VOICE CHANNEL IS FULL", iconURL: emb.disc.alert })
                    ],
                    ephemeral: true
                });

            if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) return interaction.reply({
                embeds: [new MessageEmbed()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "NOTHING PLAYING YET", iconURL: emb.disc.alert })
                ],
                ephemeral: true
            })

            if (check_if_dj(client, member, newQueue?.songs[0])) {
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setTimestamp()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "YOU ARE NOT A DJ OR THE SONG REQUESTER", iconURL: emb.disc.alert })
                        .setDescription(`**DJ-ROLES:**\n> ${check_if_dj(client, member, newQueue.songs[0])}`)
                    ],
                    ephemeral: true
                });
            }

            //let IntOption = options.getInteger("OPTIONNAME"); //same as in IntChoices //RETURNS NUMBER
            const Text = options.getString("song"); //same as in StringChoices //RETURNS STRING 
            //update it without a response!
            await interaction.reply({
                embeds: [new MessageEmbed()
                    .setAuthor({ name: "SEARCHING", iconURL: emb.disc.spin })
                    .setDescription(`Song: **${Text}**`)
                ],
                ephemeral: true
            });

            try {
                let queue = client.distube.getQueue(guildId)
                let options = { member: member, unshift: true }
                if (!queue) options.textChannel = guild.channels.cache.get(channelId)
                await client.distube.play(channel, Text, options)
            } catch (e) {
                console.log(e.stack ? e.stack : e)
                interaction.editReply({
                    embeds: [new MessageEmbed()
                        .setTimestamp()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "AN ERROR OCCURED", iconURL: emb.disc.error })
                        .setDescription(`\`/info support\` for support or DM me \`${client.user.tag}\` \`\`\`${e}\`\`\``)
                    ],
                    ephemeral: true
                })
                errDM(client, e)
            }

            //Edit the reply
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setAuthor({ name: "SKIPPED TO SONG", iconURL: emb.disc.song.add })
                    .setDescription(`Song: **${Text}**`)
                ],
                ephemeral: true
            });
        } catch (e) {
            console.log(e.stack ? e.stack : e)
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "AN ERROR OCCURED", iconURL: emb.disc.error })
                    .setDescription(`\`/info support\` for support or DM me \`${client.user.tag}\` \`\`\`${e}\`\`\``)
                ],
                ephemeral: true
            })
        }
    }
}