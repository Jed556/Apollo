const { MessageEmbed } = require('discord.js');
const emb = require('../../config/embed.json');
const { check_if_dj } = require('../../system/distubeFunctions');

module.exports = {
    name: "mix",
    description: "Plays a defined mix",
    help: "/mix [playlist]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "playlist",
            description: "Music mix",
            type: 3,
            required: true,
            choices: [
                { name: "Blues Mix", value: "Blues" },
                { name: "Charts Mix", value: "Charts" },
                { name: "Chill Mix", value: "Chill" },
                { name: "Default Mix", value: "Default" },
                { name: "Heavymetal Mix", value: "Heavymetal" },
                { name: "Gaming Mix", value: "Gaming" },
                { name: "Jazz Mix", value: "Jazz" },
                { name: "Metal Mix", value: "Metal" },
                { name: "Magic Music Mix", value: "Magic Music" },
                { name: "NCS Mix", value: "NCS" },
                { name: "Old Gaming Mix", value: "Old Gaming" },
                { name: "Pop Mix", value: "Pop" },
                { name: "Remixes Mix", value: "Remixes" },
                { name: "Rock Mix", value: "Rock" },
                { name: "Strange-Fruits Mix", value: "Strange Fruits" },
            ]
        }
    ],

    run: async (client, interaction) => {
        try {
            const { member, channelId, guildId } = interaction;
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

            let link, mixName;
            let mix = interaction.options.getString("playlist");
            switch (mix) {
                case "NCS":
                    mixName = "NCS";
                    link = "https://open.spotify.com/playlist/7sZbq8QGyMnhKPcLJvCUFD";
                    break;

                case "Pop":
                    link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";
                    break;

                case "Default":
                    link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";
                    break;

                case "Remixes":
                    link = "https://www.youtube.com/watch?v=NX7BqdQ1KeU&list=PLYUn4YaogdahwfEkuu5V14gYtTqODx7R2"
                    break;

                case "Rock":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U";
                    break;

                case "Old Gaming":
                    link = "https://www.youtube.com/watch?v=iFOAJ12lDDU&list=PLYUn4YaogdahPQPTnBGCrytV97h8ABEav";
                    break;

                case "Gaming":
                    link = "https://open.spotify.com/playlist/4a54P2VHy30WTi7gix0KW6";
                    break;

                case "Charts":
                    link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKvYin_USF1qoJQnIyMAfRxl";
                    break;

                case "Chill":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6";
                    break;

                case "Jazz":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt";
                    break;

                case "Blues":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DXd9rSDyQguIk";
                    break;

                case "Strange Fruits":
                    link = "https://open.spotify.com/playlist/6xGLprv9fmlMgeAMpW0x51";
                    break;

                case "Magic Music":
                    link = "https://www.youtube.com/watch?v=WvMc5_RbQNc&list=PLYUn4Yaogdagvwe69dczceHTNm0K_ZG3P"
                    break;

                case "Metal":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe";
                    break;

                case "Heavymetal":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe";
                    break;
            }

            await interaction.reply({
                embeds: [new MessageEmbed()
                    .setAuthor({ name: "LOADING MUSIC MIX", iconURL: emb.disc.loading })
                    .setDescription(`**Mix: ${mix}**`)
                ],
                ephemeral: true
            });

            try {
                let queue = client.distube.getQueue(guildId);
                let options = { member: member, };
                if (!queue) options.textChannel = guild.channels.cache.get(channelId);
                await client.distube.play(channel, link, options);
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
                });
            }

            //Edit the reply
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setAuthor({ name: "LOADED MUSIC MIX", iconURL: emb.disc.done })
                    .setDescription(`**NOW PLAYING: ${args[0] ? args[0] : "DEFAULT"}**`)
                ],
                ephemeral: true
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