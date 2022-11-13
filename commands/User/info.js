const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { toError } = require('../../system/functions'),
    emoji = require('../../config/emojis.json');

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
            const { user, presence, roles } = User;
            const formatter = new Intl.ListFormat("en-GB", { style: "narrow", type: "conjunction" });

            await user.fetch();

            const statusType = {
                idle: "1FJj7pX.png",
                dnd: "fbLqSYv.png",
                online: "JhW7v9d.png",
                invisible: "dibKqth.png"
            };

            const activityType = [
                "🕹 *Playing*",
                "🎙 *Streaming*",
                "🎧 *Listening to*",
                "📺 *Watching*",
                "🤹🏻‍♀️ *Custom*",
                "🏆 *Competing in*"
            ];

            const clientType = [
                { name: "desktop", text: "Computer", emoji: "💻" },
                { name: "mobile", text: "Phone", emoji: "🤳🏻" },
                { name: "web", text: "Website", emoji: "🌍" },
                { name: "offline", text: "Offline", emoji: "💤" }
            ];

            const badges = emoji.badges;

            const maxDisplayRoles = (roles, maxFieldLength = 1024) => {
                let totalLength = 0;
                const result = [];

                for (const role of roles) {
                    const roleString = `<@&${role.id}>`;

                    if (roleString.length + totalLength > maxFieldLength)
                        break;

                    totalLength += roleString.length + 1; // +1 = space
                    result.push(roleString);
                }

                return result.length;
            }

            const sortedRoles = roles.cache.map(role => role).sort((a, b) => b.position - a.position).slice(0, roles.cache.size - 1);

            const clientStatus = presence?.clientStatus instanceof Object ? Object.keys(presence.clientStatus) : "offline";
            const userFlags = user.flags.toArray();

            const deviceFilter = clientType.filter(device => clientStatus.includes(device.name));
            const devices = !Array.isArray(deviceFilter) ? new Array(deviceFilter) : deviceFilter;

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(user.hexAccentColor || "Random")
                        .setAuthor({
                            name: user.tag,
                            iconURL: `https://i.imgur.com/${statusType[presence?.status || "invisible"]}`
                        })
                        .setThumbnail(user.avatarURL({ size: 1024 }))
                        .setImage(user.bannerURL({ size: 1024 }))
                        .addFields(
                            { name: "💳 ID", value: `${user.id}` },
                            { name: "Activities", value: presence?.activities.map(activity => `${activityType[activity.type]} ${activity.name}`).join("\n") || "None" },
                            { name: "Joined Server", value: `🤝🏻 <t:${parseInt(User.joinedTimestamp / 1000)}:R>`, inline: true },
                            { name: "Account Created", value: `📆 <t:${parseInt(user.createdTimestamp / 1000)}:R>`, inline: true },
                            { name: "Nickname", value: `📛 ${User.nickname || "None"}`, inline: true },
                            {
                                name: `Roles (${maxDisplayRoles(sortedRoles)} of ${sortedRoles.length})`,
                                value: `${sortedRoles.slice(0, maxDisplayRoles(sortedRoles)).join(" ") || "None"}`
                            },
                            { name: `Badges (${userFlags.length})`, value: userFlags.length ? formatter.format(userFlags.map(flag => `**${badges[flag]}**`)) : "None" },
                            { name: `Devices`, value: devices.map(device => `${device.emoji} ${device.text}`).join("\n"), inline: true },
                            { name: "Profile Colour", value: `🎨 ${user.hexAccentColor || "None"}`, inline: true },
                            { name: "Boosting Server", value: `${emoji.boostroles} ${roles.premiumSubscriberRole ? `Since <t:${parseInt(User.premiumSinceTimestamp / 1000)}:R>` : "No"}`, inline: true },
                            { name: "Banner", value: user.bannerURL() ? "** **" : "🎏 None" }
                        )
                ], ephemeral: true
            });
        }
    }
} catch (e) { toError(e) }