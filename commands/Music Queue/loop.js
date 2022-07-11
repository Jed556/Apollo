const { MessageEmbed } = require("discord.js");
const emb = require("../../config/embed.json");
const { check_if_dj } = require('../../system/distubeFunctions');

module.exports = {
    name: "loop-queue",
    description: "Set or disable a loop",
    help: "loop-queue [loop]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "loop",
            description: "Loop to disable or enable",
            type: 3,
            required: true,
            choices: [
                { name: "Disable", value: "0" },
                { name: "Song Loop", value: "1" },
                { name: "Queue Loop", value: "2" },
            ]
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

            // Get selected loop and current loop
            let oldLoop = newQueue.repeatMode
            let loop = Number(options.getString("loop"))

            // Set embed template
            let embed = new MessageEmbed()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })

            // Return reply if loop is already active
            if (oldLoop == loop)
                return interaction.reply({
                    embeds: [embed
                        .setColor(emb.errColor)
                        .setAuthor({ name: "LOOP IS ALREADY ACTIVE", iconURL: emb.disc.alert })
                        .setDescription("The selected loop is already the active loop")
                    ],
                    ephemeral: true
                })

            // Switch reply according to loop selected
            switch (loop) {
                case 0:
                    embed.setAuthor({ name: `DISABLED ${oldLoop == 1 ? "SONG" : "QUEUE"} LOOP`, iconURL: emb.disc.loop.none })
                    break;

                case 1:
                    embed.setAuthor({ name: `${oldLoop == 0 ? "ENABLED SONG" : "DISABLED QUEUE LOOP & ENABLED SONG"} LOOP`, iconURL: emb.disc.loop.song })
                    break;

                case 2:
                    embed.setAuthor({ name: `${oldLoop == 0 ? "ENABLED QUEUE" : "DISABLED SONG LOOP & ENABLED QUEUE"} LOOP`, iconURL: emb.disc.loop.queue })
                    break;
            }

            // Set loop and send reply
            await newQueue.setRepeatMode(loop);
            return interaction.reply({ embeds: [embed] })
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