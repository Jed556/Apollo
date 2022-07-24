const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const FiltersSettings = require('../../config/filters.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "bass-filter",
    description: "Sets a custom song bassboost with gain",
    help: "/bass-filter [gain]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "gain",
            description: "Sets a custom song bassboost with gain",
            type: 4,
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

        let bass_gain = options.getInteger("gain")
        if (bass_gain > 20 || bass_gain < 0) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "BASSBOOST GAIN MUST BE BETWEEN 0 AND 20", iconURL: emb.disc.alert })
                ],
            });
        }

        FiltersSettings.custombassboost = `bass=g=${bass_gain},dynaudnorm=f=200`;
        client.distube.filters = FiltersSettings;

        if (newQueue.filters.includes("custombassboost")) {
            await newQueue.setFilter(["custombassboost"]);
        }

        await newQueue.setFilter(["custombassboost"]);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: `BASSBOOST SET TO ${bass_gain}`, iconURL: emb.disc.filter.set })
            ]
        });
    }
}