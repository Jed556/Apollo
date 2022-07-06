const { MessageEmbed } = require("discord.js");
const emb = require("../../config/embed.json");
const FiltersSettings = require("../../config/filters.json");
const { check_if_dj } = require('../../system/distubeFunctions');

module.exports = {
    name: "bassboost",
    description: "Sets a custom song bassboost with gain",
    help: "/bassboost [gain]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [{
        name: "gain",
        description: "Sets a custom song bassboost with gain",
        type: 4,
        required: true,
    }
    ],

    run: async (client, interaction) => {
        try {
            const { member, guildId, options } = interaction;
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

            let bass_gain = options.getInteger("gain")
            if (bass_gain > 20 || bass_gain < 0) {
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setTimestamp()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "BASSBOOST GAIN MUST BE BETWEEN 0 AND 20", iconURL: emb.disc.alert })
                    ],
                })
            }

            FiltersSettings.custombassboost = `bass=g=${bass_gain},dynaudnorm=f=200`;
            client.distube.filters = FiltersSettings;
            //add old filters so that they get removed 	
            //if it was enabled before then add it
            if (newQueue.filters.includes("custombassboost")) {
                await newQueue.setFilter(["custombassboost"]);
            }

            await newQueue.setFilter(["custombassboost"]);
            interaction.reply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: `BASSBOOST SET TO ${bass_gain}`, iconURL: emb.disc.filter.set })
                ]
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