const { EmbedBuilder } = require('discord.js');
const emb = require('../config/embed.json');
const { cyanBright, greenBright, yellow, red, bold, dim } = require('chalk');

// EXPORT ALL FUNCTIONS
module.exports = {
    check_if_dj,
    distubeValidate
}

/**
 * 
 * @param {*} interaction Command interaction
 * @param {*} newQueue Music queue
 * @param {Array} checks Checks to run ("channel", "userLimit", "playing", "previous", "DJ", "all")
 * @returns response to interaction
 */
function distubeValidate(interaction, newQueue, checks, args) {
    const checksArray = ["channel", "userLimit", "playing", "previous", "DJ", "all"]
    if (!checksArray.some(c => checks.includes(c)))
        return console.log(red.bold("[ERROR]") + ` Variable ${bold("checks")} doesn't include any of ${checksArray.map(c => `\"${c}\"`).join(", ")}`);

    const { client, member, channelId, guildId } = interaction;
    const { guild } = member;
    const { channel } = member.voice;

    if (checks.includes("channel" || "all"))
        if (!channel) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "JOIN A VOICE CHANNEL FIRST", iconURL: emb.disc.alert })
                ],
                ephemeral: true
            });
        } else if (channel.guild.members.me.voice.channel && channel.guild.members.me.voice.channel.id != channel.id)
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "JOIN MY VOICE CHANNEL FIRST", iconURL: emb.disc.alert })
                    .setDescription(`**Channel: <#${channel.guild.members.me.voice.channel.id}>**`)
                ],
                ephemeral: true
            });

    if (channel.userLimit != 0 && channel.full && !channel && checks.includes("userLimit" || "all"))
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: "YOUR VOICE CHANNEL IS FULL", iconURL: emb.disc.alert })
            ],
            ephemeral: true
        });

    if (!newQueue || !newQueue.songs || newQueue.songs.length == 0 && checks.includes("playing" || "all")) {
        let argVal;
        args.forEach((a) => {
            if (checksArray.includes(a.name)) argVal = a.value;

        });
        if (!argVal) return

        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: "NOTHING PLAYING YET", iconURL: emb.disc.alert })
            ],
            ephemeral: true
        });
    }

    if (!newQueue || !newQueue.previousSongs || newQueue.previousSongs.length == 0 && checks.includes("previous" || "all"))
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: "NO PREVIOUS SONG", iconURL: emb.disc.alert })
            ],
            ephemeral: true
        });

    if (check_if_dj(client, member, newQueue?.songs[0]) && checks.includes("DJ" || "all")) {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: "YOU ARE NOT A DJ OR THE SONG REQUESTER", iconURL: emb.disc.alert })
                .setDescription(`**DJ-ROLES:**\n> ${check_if_dj(client, member, newQueue.songs[0])}`)
            ],
            ephemeral: true
        });
    }

    return false;
}

/**
 * 
 * @param {*} client discord client
 * @param {*} member interaction.member
 * @param {*} song song data
 * @returns string if not a DJ or no DJs set
 */
function check_if_dj(client, member, song) {
    //if no message added return
    if (!client) return false;
    //get the adminroles
    var roleid = client.distubeSettings.get(member.guild.id, 'djroles');
    //if no dj roles return false, so that it continues
    if (String(roleid) == "") return false;

    //define variables
    var isdj = false;

    //loop through the roles
    for (let i = 0; i < roleid.length; i++) {
        //if the role does not exist, then skip this current loop run
        if (!member.guild.roles.cache.get(roleid[i])) continue;
        //if he has role set var to true
        if (member.roles.cache.has(roleid[i])) isdj = true;
        //add the role to the string
    }
    //if no dj and not an admin, return the string
    if (!song) return;
    if (!isdj && !member.permissions.has("ADMINISTRATOR") && song.user.id != member.id)
        return roleid.map(i => `<@&${i}>`).join(", ");
    //if he is a dj or admin, then return false, which will continue the cmd
    else
        return false;
}