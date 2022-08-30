const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const FiltersSettings = require('../../config/filters.json');
const { distubeValidate } = require('../../system/distubeFunctions');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("list-filter")
            .setDescription("Lists all active and possible filters")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/list-filter",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { guildId } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["playing"]);
            if (validate) return;

            let filterList = []
            for (var f in FiltersSettings) {
                if (newQueue.filters.has(f)) filterList.push(f);
            }

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.color)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setFields([
                        { name: "**All Valid Filters:**", value: Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ") + "\n\n**Note:**\n> *All filters, starting with custom have their own command to define a custom amount*" },
                        { name: "**All __current__ Filters:**", value: filterList && filterList.length > 0 ? filterList.map(f => `\`${f}\``).join(", ") : `None` }
                    ])
                ],
            });
        }
    }
} catch (e) { }