const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const FiltersSettings = require('../../config/filters.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "list-filter",
    description: "Lists all active and possible filters",
    help: "/list-filter",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [],
    category: "music",

    run: async (client, interaction) => {
        const { guildId } = interaction;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["playing"]);
        if (validate) return;

        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(emb.color)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setFields([
                    { name: "**All Valid Filters:**", value: Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ") + "\n\n**Note:**\n> *All filters, starting with custom have their own command to define a custom amount*" },
                    { name: "**All __current__ Filters:**", value: newQueue.filters && newQueue.filters.length > 0 ? newQueue.filters.map(f => `\`${f}\``).join(", ") : `None` }
                ])
            ],
        });
    }
}