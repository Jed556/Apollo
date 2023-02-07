const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    FiltersSettings = require('../../config/filters.json'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("set-filter")
            .setDescription("Sets / Overrides current filters")
            .setDefaultMemberPermissions()
            .setDMPermission(false)
            .addStringOption(option => option
                .setName("filters")
                .setDescription("Filters to set (Use spaces for multiple filters)")
                .setRequired(true)
            ),
        help: "/set-filter [filters]",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId, options } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
            if (validate) return;

            let filters = options.getString("filters").toLowerCase().split(" ");
            if (filters.some(a => !FiltersSettings[a])) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "SPECIFIED FILTER IS INVALID", iconURL: emb.disc.alert })
                        .setDescription("**Add a SPACE (` `) in between to define multiple filters**")
                        .setFields({ name: "**All Valid Filters:**", value: Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ") + "\n\n**Note:**\n> *All filters, starting with custom have their own command to define a custom amount*" })
                    ],
                })
            }

            if (!filters || filters.length == 0) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "NO FILTER SPECIFIED FILTER", iconURL: emb.disc.alert })
                        .setFields({ name: "**All current filters:**", value: newQueue.filters.map(f => `\`${f}\``).join(", ") })
                    ],
                });
            }

            await newQueue.filters.set(filters);
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: `SET ${filters.length} FILTERS`, iconURL: emb.disc.set })
                ]
            });
        }
    }
} catch (e) { toError(e, null, 0, false) }