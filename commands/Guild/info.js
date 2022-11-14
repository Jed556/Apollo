const
    { EmbedBuilder, SlashCommandBuilder, ChannelType, GuildVerificationLevel, GuildExplicitContentFilter, GuildNSFWLevel } = require('discord.js'),
    { toError } = require('../../system/functions'),
    emoji = require('../../config/emojis.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("server-info")
            .setDescription("Displays server information")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/server-info",
        cooldown: 2,
        allowedUIDs: [],

        run: async (client, interaction) => {
            const { guild } = interaction;
            const {
                members,
                channels,
                emojis,
                roles,
                stickers
            } = guild;

            const sortedRoles = roles.cache.map(role => role).slice(1, roles.cache.size).sort((a, b) => b.position - a.position);
            const userRoles = sortedRoles.filter(role => !role.managed);
            const managedRoles = sortedRoles.filter(role => role.managed);
            const botCount = members.cache.filter(member => member.user.bot).size;

            const maxDisplayRoles = (roles, maxFieldLength = 1024) => {
                let totalLength = 0;
                const result = [];

                for (const role of roles) {
                    const roleString = `<@&${role.id}>`;

                    if (roleString.length + totalLength > maxFieldLength)
                        break;

                    totalLength += roleString.length + 1; // +1 = spaces
                    result.push(roleString);
                }

                return result.length;
            }

            const splitPascal = (string, separator) => string.split(/(?=[A-Z])/).join(separator);
            const toPascalCase = (string, separator = false) => {
                const pascal = string.charAt(0).toUpperCase() + string.slice(1).toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
                return separator ? splitPascal(pascal, separator) : pascal;
            };

            const getChannelTypeSize = type => channels.cache.filter(channel => type.includes(channel.type)).size;

            const totalChannels = getChannelTypeSize([
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.GuildVoice,
                ChannelType.GuildStageVoice,
                ChannelType.GuildForum,
                ChannelType.PublicThread,
                ChannelType.PrivateThread,
                ChannelType.AnnouncementThread,
                ChannelType.GuildCategory
            ]);

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(members.me.roles.highest.hexColor)
                        .setTitle(`${guild.name}'s Information`)
                        .setThumbnail(guild.iconURL({ size: 1024 }))
                        .setImage(guild.bannerURL({ size: 1024 }))
                        .addFields(
                            { name: "📝 Description", value: `${guild.description || "None"}` },
                            {
                                name: "General",
                                value: [
                                    `📜 **Created** <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
                                    `💳 **ID** ${guild.id}`,
                                    `${emoji.owner} **Owner** <@${guild.ownerId}>`,
                                    `🌍 **Language** ${new Intl.DisplayNames(["en"], { type: "language" }).of(guild.preferredLocale)}`,
                                    `💻 **Vanity URL** ${guild.vanityURLCode || "None"}`,
                                ].join("\n")
                            },
                            { name: "Features", value: guild.features?.map(feature => `• ${toPascalCase(feature, " ")}`)?.join("\n") || "None", inline: true },
                            {
                                name: "Security",
                                value: [
                                    `👀 **Explicit Filter** ${splitPascal(GuildExplicitContentFilter[guild.explicitContentFilter], " ")}`,
                                    `🔞 **NSFW Level** ${splitPascal(GuildNSFWLevel[guild.nsfwLevel], " ")}`,
                                    `🔒 **Verification Level** ${splitPascal(GuildVerificationLevel[guild.verificationLevel], " ")}`
                                ].join("\n"),
                                inline: true
                            },
                            {
                                name: `Users (${guild.memberCount})`,
                                value: [
                                    `🧑🏻‍👩🏻‍👧🏻‍👦🏻 **Members** ${guild.memberCount - botCount}`,
                                    `🤖 **Bots** ${botCount}`
                                ].join("\n"),
                                inline: true
                            },
                            { name: `User Roles (${maxDisplayRoles(userRoles)} of ${userRoles.length})`, value: `${userRoles.slice(0, maxDisplayRoles(userRoles)).join(" ") || "None"}` },
                            { name: `Managed Roles (${maxDisplayRoles(managedRoles)} of ${managedRoles.length})`, value: `${managedRoles.slice(0, maxDisplayRoles(managedRoles)).join(" ") || "None"}` },
                            {
                                name: `Channels, Threads & Categories (${totalChannels})`,
                                value: [
                                    `💬 **Text** ${getChannelTypeSize([ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildAnnouncement])}`,
                                    `🎙 **Voice** ${getChannelTypeSize([ChannelType.GuildVoice, ChannelType.GuildStageVoice])}`,
                                    `🧵 **Threads** ${getChannelTypeSize([ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread])}`,
                                    `📑 **Categories** ${getChannelTypeSize([ChannelType.GuildCategory])}`
                                ].join("\n"),
                                inline: true
                            },
                            {
                                name: `Emojis & Stickers (${emojis.cache.size + stickers.cache.size})`,
                                value: [
                                    `📺 **Animated** ${emojis.cache.filter(emoji => emoji.animated).size}`,
                                    `🗿 **Static** ${emojis.cache.filter(emoji => !emoji.animated).size}`,
                                    `🏷 **Stickers** ${stickers.cache.size}`
                                ].join("\n"),
                                inline: true
                            },
                            {
                                name: "Nitro",
                                value: [
                                    `📈 **Tier** ${guild.premiumTier || "None"}`,
                                    `${emoji.boostroles} **Boosts** ${guild.premiumSubscriptionCount}`,
                                    `${emoji.blurpleboost} **Boosters** ${guild.members.cache.filter(member => member.roles.premiumSubscriberRole).size}`,
                                    `${emoji.boost} **Total Boosters** ${guild.members.cache.filter(member => member.premiumSince).size}`
                                ].join("\n"),
                                inline: true
                            },
                            { name: "Banner", value: guild.bannerURL() ? "** **" : "None" }
                        )
                ], ephemeral: true
            });
        }
    }
} catch (e) { toError(e) }