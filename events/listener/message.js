const
    emb = require('../../config/embed.json'),
    { EmbedBuilder } = require('discord.js'),
    { randomNum } = require('../../system/functions'),
    { bold, dim } = require('chalk'),
    chalk = require('chalk'),
    blurple = chalk.bold.hex("#7289da");

// Variable checks (Use .env if present)
require('dotenv').config();
let ListenerFriendlyMode, ListenerDM, ListenerGuild, OwnerID, AdminIDs = [];
if (process.env.listenerInteraction) {
    ListenerFriendlyMode = process.env.listenerDM;
    ListenerDM = process.env.listenerGuild;
    ListenerGuild = process.env.listenerFriendly;
    OwnerID = process.env.ownerID;
    if (process.env.adminIDs) AdminIDs = process.env.adminIDs.split(', ');
} else {
    const { listener, ownerID, adminIDs } = require('../../config/client.json');
    ListenerFriendlyMode = listener.friendlyMode;
    ListenerDM = listener.DM;
    ListenerGuild = listener.guild;
    OwnerID = ownerID;
    AdminIDs = adminIDs;
}

module.exports = {
    name: "messageCreate",
    on: true,
    run: async (client, message) => {
        if (message.author.bot) return;
        if ((!message.guild || !message.channel) && ListenerDM) return DM();

        if (ListenerGuild) {
            const
                guild = message.guild.name,
                guildID = message.guild.id,
                channel = message.channel.name,
                channelID = interaction.channel.id,
                user = message.author.tag,
                userID = message.author.id;
            console.log(`${blurple(`[${guild} ${dim(`<${guildID}>`)} in #${channel} ${dim(`<${channelID}>`)} from ${user} ${dim(`<${userID}>`)}]`)}${message.content ? ` MESSAGE: ${message.content}` : ""}${message.attachments.size ? ` ATTACHMENT: ${message.attachments.first().url}` : ""}`);
        }

        // DM message logging
        function DM() {
            const log = new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFields({
                    name: `Message:`,
                    value: `${message.content ? `> ${message.content}` : "\u200b"}`
                })
                //.setImage(`${message.attachments.size ? `${message.attachments.first().url}` : ""}`)
                .setAuthor({ name: user, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(`ID: ||[${userID}](https://discord.com/users/${userID})||`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })

            const msg = message.content.toLowerCase()

            // Friendly auto reply
            if (ListenerFriendlyMode) {
                if ((msg == "hi") || (msg == "hello") || (msg == "hey")) {
                    const replyArray = ["Yoooo!", "Hey There!", "Hello There!", "Hello Friend!", "Heyyy!"]
                    const reply = replyArray[randomNum(replyArray.length)];
                    message.reply({
                        embeds: [new EmbedBuilder()
                            .setTimestamp()
                            .setColor(emb.color)
                            .setTitle(reply)
                            .setFooter({ text: `${client.user.username} - Autoreply`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                        ]
                    });
                    log.addFields({
                        name: `Reply:`,
                        value: `> ${reply}`
                    })
                }

                const illegalArray = [
                    "fuck", "shit", "bitch", "nigga", "piss off", "dick head", "asshole", "bastard", "cunt", "wanker",
                    "twat", "tangina", "puta", "pota", "putang ina", "putangina", "bobo", "bubu", "bobu", "bubo", "vovo",
                    "vuvu", "vovu", "vuvo", "potaena", "putanginamo", "pokpok", "gago", "pakshet", "pucha", "ulol",
                    "punyeta", "tarantado", "pakyu", "fuck u"
                ]
                if (illegalArray.some(v => msg.includes(v))) {
                    const replyArray = ["That's illegal!", "Watch your language!", "Watch your fucking mouth!", "Mind your tone!", "Whoaaaa!"]
                    const reply = replyArray[randomNum(replyArray.length)];
                    var match = msg.match(new RegExp(illegalArray.join("|"), "g"))
                    message.reply({
                        embeds: [new EmbedBuilder()
                            .setTimestamp()
                            .setColor(emb.errColor)
                            .setTitle(reply)
                            .setFields({
                                name: `Reason:`,
                                value: `> ${match.map(m => `\`${m}\``).join(", ")}`
                            })
                            .setFooter({ text: `${client.user.username} - Autoreply`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                        ]
                    });
                    log.addFields(
                        {
                            name: `Reply:`,
                            value: `> ${reply}`
                        },
                        {
                            name: `Reason:`,
                            value: `> ${match.map(m => `\`${m}\``).join(", ")}`
                        })
                    log.setColor(emb.errColor)
                }
            }

            client.users.fetch(OwnerID, false).then((user) => {
                user.send({ embeds: [log] });
            });
            console.log(`${blurple(`[${user} <${userID}> ]`)}${message.content ? ` ${bold("MESSAGE:")} ${message.content}` : ""}${message.attachments.size ? ` ${bold("ATTACHMENT:")} ${message.attachments.first().url}` : ""}`);
        }
    }
}