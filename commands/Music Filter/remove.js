const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const FiltersSettings = require('../../config/filters.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "remove-filter",
    description: "Removes a song filter",
    help: "/remove-filter [filters]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "filters",
            description: "Filters to remove (Use spaces for multiple filters)",
            type: 3,
            required: true,
        }
    ],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId, options } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        let filters = options.getString("filters").toLowerCase().split(" ");
        if (!filters) filters = [options.getString("filters").toLowerCase()];
        if (filters.some(a => !FiltersSettings[a])) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "SPECIFIED FILTER IS INVALID", iconURL: emb.disc.alert })
                    .setDescription("**Add a SPACE (` `) in between to define multiple filters**")
                    .setFields({ name: "**All Valid Filters:**", value: Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ") + "\n\n**Note:**\n> *All filters, starting with custom have their own command to define a custom amount*" })
                ]
            });
        }

        let toRemove = [];
        // Add new filters
        filters.forEach((f) => {
            if (newQueue.filters.includes(f)) {
                toRemove.push(f);
            }
        });
        if (!toRemove || toRemove.length == 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "NO FILTER SPECIFIED FILTER", iconURL: emb.disc.alert })
                        .setFields({ name: "**All current filters:**", value: newQueue.filters.map(f => `\`${f}\``).join(", ") })
                ],
            });
        }

        await newQueue.setFilter(toRemove);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: `REMOVED ${toRemove.length} ${toRemove.length == filters.length ? "FILTERS" : `OF ${filters.length} FILTERS`}`, iconURL: emb.disc.filter.remove })
            ]
        });
    }
}