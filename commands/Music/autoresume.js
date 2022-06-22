const { MessageEmbed } = require('discord.js');
const emb = require('../../config/embed.json');
const { check_if_dj } = require('../../system/distubeFunctions');

module.exports = {
    name: "autoresume",
    description: "Autoresume music if the bot restarts (Toggles autoresume)",
    help: "/autoresume",
    cooldown: 2,
    permissions: [],
    options: [],

    run: async (client, interaction) => {
        try {
            const { member, guildId } = interaction;
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

            client.settings.set(guild.id, !client.settings.get(guild.id, "autoresume"), "autoresume");
            if (client.settings.get(guild.id, "autoresume")) {
                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor(emb.color)
                            .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                            .setAuthor({ name: "ENABLED AUTORESUME", iconURL: emb.disc.autoresume.on })
                    ],
                })
            } else {
                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor(emb.color)
                            .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                            .setAuthor({ name: "DISABLED AUTORESUME", iconURL: emb.disc.autoresume.off })
                    ],
                })
            }
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
    }
}