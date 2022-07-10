const { MessageEmbed } = require("discord.js");
const emb = require("../../config/embed.json");
const FiltersSettings = require("../../config/filters.json");
const { check_if_dj } = require('../../system/distubeFunctions');

module.exports = {
    name: "remove-filter",
    description: "Removes a song filter",
    help: "/remove-filter [filters]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "filters",
            description: "Filters to remove (Use spaces for multiple filters)",
            type: 3,
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

            if (!newQueue || !newQueue.songs || newQueue.songs.length == 0)
                return interaction.reply({
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

            let filters = options.getString("filters").toLowerCase().split(" ");
            if (!filters) filters = [options.getString("filters").toLowerCase()]
            if (filters.some(a => !FiltersSettings[a])) {
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "SPECIFIED FILTER IS INVALID", iconURL: emb.disc.alert })
                        .setDescription("**Add a SPACE (` `) in between to define multiple filters**")
                        .addField("**All Valid Filters:**", Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ") + "\n\n**Note:**\n> *All filters, starting with custom are having there own command, please use them to define what custom amount u want*")
                    ]
                })
            }

            let toRemove = [];
            // Add new filters
            filters.forEach((f) => {
                if (newQueue.filters.includes(f)) {
                    toRemove.push(f)
                }
            })
            if (!toRemove || toRemove.length == 0) {
                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor(emb.errColor)
                            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                            .setAuthor({ name: "NO FILTER SPECIFIED FILTER", iconURL: emb.disc.alert })
                            .addField("**All current filters:**", newQueue.filters.map(f => `\`${f}\``).join(", "))
                    ],
                })
            }

            await newQueue.setFilter(toRemove);
            interaction.reply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: `REMOVED ${toRemove.length} ${toRemove.length == filters.length ? "FILTERS" : `OF ${filters.length} FILTERS`}`, iconURL: emb.disc.filter.remove })
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