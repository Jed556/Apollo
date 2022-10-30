const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { toError } = require('../../system/functions'),
    emoji = require('../../config/emojis.json'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("user-info")
            .setDescription("Displays mentioned user or your information")
            .setDefaultMemberPermissions()
            .setDMPermission(false)
            .addUserOption(option => option
                .setName("user")
                .setDescription("User to check")
                .setRequired(false)
            ),
        help: "/user-info (user)",
        cooldown: 2,
        allowedUIDs: [],

        run: async (client, interaction) => {
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
            const embed = new EmbedBuilder()
                .setTitle(`${user.tag}`)
                .setTimestamp()
                .setColor(user.accentColor || emb.color)
                .setDescription(`${badges.join(" ")} ${rolesMap ? "\n\n**Roles:** " + rolesMap : ""}`)
                .setThumbnail(user.avatarURL({ dynamic: true }))
                .setFields([
                    { name: "ID:", value: `\`${User.id}\``, inline: false },
                    { name: "Nickname:", value: `${User.nickname || "\u200b"}`, inline: true },
                    { name: 'Username', value: `${user.username}`, inline: true },
                    { name: "Discriminator:", value: `#${user.discriminator}`, inline: true },
                    { name: "Accent Color", value: `${user.accentColor ? "#" + user.accentColor.toString(16) : user.bot ? "Auto" : "None"}`, inline: true },
                    { name: "Banner", value: `${user.bannerURL() ? "True" : "None"}`, inline: true },
                    { name: "Is Bot:", value: `${user.bot ? "Yes" : "No"}`, inline: true },
                    { name: "Joined:", value: `<t:${parseInt(User.joinedTimestamp / 1000)}:R>`, inline: true },
                    { name: "Created:", value: `<t:${parseInt(user.createdTimestamp / 1000)}:R>`, inline: true }
                ])
                .setFooter({ text: `Requested by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) });

            if (!user.bot && user.banner) {
                embed.setImage(user.bannerURL({ dynamic: true, size: 512 }) || "")
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
} catch (e) { toError(e) }