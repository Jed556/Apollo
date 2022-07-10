const { MessageEmbed } = require("discord.js");
const emb = require("../../config/embed.json");
const FiltersSettings = require("../../config/filters.json");

module.exports = {
    name: "list-filter",
    description: "Lists all active and possible filters",
    help: "/list-filter",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [],

    run: async (client, interaction) => {
        try {
            const { guildId } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            if (!newQueue || !newQueue.songs || newQueue.songs.length == 0)
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "NOTHING PLAYING YET", iconURL: emb.disc.alert })
                    ],
                    ephemeral: true
                })

            return interaction.reply({
                embeds: [new MessageEmbed()
                    .setColor(emb.color)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .addField("**All available Filters:**", Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ") + "\n\n**Note:**\n> *All filters, starting with custom have their own command to define a custom amount*")
                    .addField("**All __current__ Filters:**", newQueue.filters && newQueue.filters.length > 0 ? newQueue.filters.map(f => `\`${f}\``).join(", ") : `None`)
                ],
            })
        } catch (e) {
            console.log(e.stack ? e.stack : e);
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "AN ERROR OCCURED", iconURL: emb.disc.error })
                    .setDescription(`\`/info support\` for support or DM me \`${client.user.tag}\` \`\`\`${e}\`\`\``)
                ],
                ephemeral: true
            });
        }
    }
}