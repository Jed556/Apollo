const { MessageEmbed } = require('discord.js');
const emb = require('../../config/embed.json');
const { check_if_dj } = require('../../system/distubeFunctions');

module.exports = {
    name: "mix",
    description: "Plays a defined mix",
    help: "/mix [mix]",
    cooldown: 2,
    permissions: [],
    options: [{
        name: "mix",
        description: "Music mix",
        type: 3,
        required: true,
        choices: [
            { name: "Blues Mix", value: "blues" },
            { name: "Charts Mix", value: "charts" },
            { name: "Chill Mix", value: "chill" },
            { name: "Default Mix", value: "default" },
            { name: "Heavymetal Mix", value: "heavymetal" },
            { name: "Gaming Mix", value: "gaming" },
            { name: "Jazz Mix", value: "jazz" },
            { name: "Metal Mix", value: "metal" },
            { name: "Magic-Release Mix", value: "magic-release" },
            { name: "NCS Mix", value: "ncs" },
            { name: "No Copyright Mix", value: "nocopyright" },
            { name: "Old Gaming Mix", value: "oldgaming" },
            { name: "Pop Mix", value: "pop" },
            { name: "Remixes Mix", value: "remixes" },
            { name: "Rock Mix", value: "rock" },
            { name: "Strange-Fruits Mix", value: "strange-fruits-gaming" },
        ]
    }
    ],

    run: async (client, interaction) => {
        try {
            const { member, channelId, guildId } = interaction;
            const { guild } = member;
            const { channel } = member.voice;
            let newQueue = client.distube.getQueue(guildId);

            if (!channel && channel.guild.me.voice.channel.id != channel.id)
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: `JOIN ${channel.guild.me.voice.channel ? "MY" : "A"} VOICE CHANNEL FIRST`, iconURL: emb.disc.alert })
                        .setDescription(channel.id ? `**Channel: <#${channel.id}>**` : "")
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

            let link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";
            let args = [interaction.options.getString("mix")]
            if (args[0]) {
                //ncs | no copyrighted music
                if (args[0].toLowerCase().startsWith("n")) link = "https://open.spotify.com/playlist/7sZbq8QGyMnhKPcLJvCUFD";
                //pop
                if (args[0].toLowerCase().startsWith("p")) link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";
                //default
                if (args[0].toLowerCase().startsWith("d")) link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";
                //remixes from Magic Release
                if (args[0].toLowerCase().startsWith("re")) link = "https://www.youtube.com/watch?v=NX7BqdQ1KeU&list=PLYUn4YaogdahwfEkuu5V14gYtTqODx7R2"
                //rock
                if (args[0].toLowerCase().startsWith("ro")) link = "https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U";
                //oldgaming
                if (args[0].toLowerCase().startsWith("o")) link = "https://www.youtube.com/watch?v=iFOAJ12lDDU&list=PLYUn4YaogdahPQPTnBGCrytV97h8ABEav"
                //gaming
                if (args[0].toLowerCase().startsWith("g")) link = "https://open.spotify.com/playlist/4a54P2VHy30WTi7gix0KW6";
                //Charts
                if (args[0].toLowerCase().startsWith("cha")) link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKvYin_USF1qoJQnIyMAfRxl"
                //Chill
                if (args[0].toLowerCase().startsWith("chi")) link = "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6";
                //Jazz
                if (args[0].toLowerCase().startsWith("j")) link = "https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt";
                //blues
                if (args[0].toLowerCase().startsWith("b")) link = "https://open.spotify.com/playlist/37i9dQZF1DXd9rSDyQguIk";
                //strange-fruits
                if (args[0].toLowerCase().startsWith("s")) link = "https://open.spotify.com/playlist/6xGLprv9fmlMgeAMpW0x51";
                //magic-release
                if (args[0].toLowerCase().startsWith("ma")) link = "https://www.youtube.com/watch?v=WvMc5_RbQNc&list=PLYUn4Yaogdagvwe69dczceHTNm0K_ZG3P"
                //metal
                if (args[0].toLowerCase().startsWith("me")) link = "https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe";
                //heavy metal
                if (args[0].toLowerCase().startsWith("h")) link = "https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe";
            } //update it without a response!
            await interaction.reply({
                embeds: [new MessageEmbed()
                    .setAuthor({ name: "LOADING MUSIC MIX", iconURL: emb.disc.loading })
                    .setDescription(`**Mix: ${args[0] ? args[0] : "DEFAULT"}**`)
                ],
                ephemeral: true
            });

            try {
                let queue = client.distube.getQueue(guildId)
                let options = { member: member, }
                if (!queue) options.textChannel = guild.channels.cache.get(channelId)
                await client.distube.play(channel, link, options)
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

            //Edit the reply
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setAuthor({ name: "LOADED MUSIC MIX", iconURL: emb.disc.done })
                    .setDescription(`**NOW PLAYING: ${args[0] ? args[0] : "DEFAULT"}**`)
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