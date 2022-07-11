const { MessageEmbed, MessageSelectMenu, MessageActionRow } = require("discord.js");
const emb = require("../../config/embed.json");

module.exports = {
    name: "list-queue",
    description: "Lists the current music queue",
    help: "list-queue",
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

            let embeds = [];
            let k = 10;
            let theSongs = newQueue.songs;
            //defining each Pages
            for (let i = 0; i < theSongs.length; i += 10) {
                let qus = theSongs;
                const current = qus.slice(i, k)
                let j = i;
                const info = current.map((track) => `**${j++} -** [\`${String(track.name).replace(/\[/igu, "{").replace(/\]/igu, "}").substr(0, 60)}\`](${track.url}) - \`${track.formattedDuration}\``).join("\n")
                const embed = new MessageEmbed()
                    .setColor(emb.color)
                    .setDescription(`${info}`)
                if (i < 10) {
                    embed.setAuthor({ name: `TOP ${theSongs.length > 50 ? 50 : theSongs.length} | QUEUE OF ${guild.name}`, iconURL: emb.disc.list });
                    embed.setDescription(`**(0) Current Song:**\n> [\`${theSongs[0].name.replace(/\[/igu, "{").replace(/\]/igu, "}")}\`](${theSongs[0].url})\n\n${info}`);
                }
                embeds.push(embed);
                k += 10; //Raise k to 10
            }
            embeds[embeds.length - 1] = embeds[embeds.length - 1]
                .setFooter({ text: client.user.username + `\n${theSongs.length} Song${theSongs.length != 1 ? "s" : ""} in Queue | Duration: ${newQueue.formattedDuration}`, iconURL: client.user.displayAvatarURL() })

            let pages = []
            for (let i = 0; i < embeds.length; i += 3) {
                pages.push(embeds.slice(i, i + 3));
            }
            pages = pages.slice(0, 24)
            const Menu = new MessageSelectMenu()
                .setCustomId("QUEUEPAGES")
                .setPlaceholder("Select Page")
                .addOptions([
                    pages.map((page, index) => {
                        let Obj = {};
                        Obj.label = `Page ${index}`
                        Obj.value = `${index}`;
                        Obj.description = `Shows the ${index}/${pages.length - 1} Page`
                        return Obj;
                    })
                ])
            const row = new MessageActionRow().addComponents([Menu])
            interaction.reply({
                embeds: [embeds[0]],
                components: [row],
                ephemeral: true
            });

            //Event
            client.on('interactionCreate', (i) => {
                if (!i.isSelectMenu()) return;
                if (i.customId === "QUEUEPAGES" && i.applicationId == client.user.id) {
                    i.reply({
                        embeds: pages[Number(i.values[0])],
                        ephemeral: true
                    }).catch(e => { })
                }
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