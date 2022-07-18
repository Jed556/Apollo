const { MessageEmbed } = require('discord.js');
const emb = require("../../config/embed.json");
const emoji = require('../../config/emojis.json');
const moment = require('moment');

module.exports = {
    name: "info-user",
    description: "Display mentioned user or command user's information",
    help: "/info-user (user)",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "user",
            description: "User to check",
            type: 6,
            required: false
        }
    ],

    run: async (client, interaction) => {
        try {
            const { member } = interaction;
            const User = interaction.options.getMember("user") || member;
            const { user } = User;
            await user.fetch();
            const flags = user.flags.toArray();

            let badges = [];
            emoji.badges.forEach((e) => {
                if (flags.includes(e.name)) badges.push(e.emoji);
            });

            const roles = User.roles.cache;
            const rolesMap = roles.map(r => r).join(" ").replace("@everyone", "");
            const embed = new MessageEmbed()
                .setTitle(`${user.tag}`)
                .setTimestamp()
                .setColor(user.accentColor || emb.color)
                .setDescription(badges.join(" ") + `${rolesMap ? "\n\n**Roles:** " + rolesMap : ""}`)
                .setThumbnail(user.avatarURL({ dynamic: true }))
                .addFields(
                    { name: "ID:", value: `\`\`\`${User.id}\`\`\``, inline: false },
                    { name: "Nickname:", value: `\`\`\`${User.nickname || " "}\`\`\``, inline: true },
                    { name: "Discriminator:", value: `\`\`\`#${user.discriminator}\`\`\``, inline: true },
                    { name: "Accent Color", value: `\`\`\`${user.accentColor ? "#" + user.accentColor.toString(16) : "None"}\`\`\``, inline: true },
                    { name: "Banner", value: `${user.bannerURL() ? "\`\`\`True\`\`\`" : "\`\`\`False\`\`\`"}`, inline: true },
                    { name: "Is Bot:", value: `\`\`\`${user.bot ? "Yes" : "No"}\`\`\``, inline: true },
                    { name: 'Nitro', value: `${User.premiumSubscriptionCount ? '\`\`\`Yes\`\`\`' : '\`\`\`No\`\`\`'}`, inline: true },
                    { name: "Joined at:", value: `\`\`\`${moment(User.joinedTimestamp).format('MMM Do YYYY')}\`\`\``, inline: true },
                    { name: "Created at:", value: `\`\`\`${moment(User.createdAt).format('MMM Do YYYY')}\`\`\``, inline: true },
                )
                .setImage(user.bannerURL({ dynamic: true, size: 512 }) || "")
                .setFooter({ text: `Requested by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (e) {
            console.log(String(e.stack));
        }
    }
}