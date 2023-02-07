const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    FiltersSettings = require('../../config/filters.json'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("bass-filter")
            .setDescription("Sets a custom song bassboost with gain")
            .setDefaultMemberPermissions()
            .setDMPermission(false)
            .addNumberOption(option => option
                .setName("gain")
                .setDescription("Bass gain (0-20)")
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(20)
            ),
        help: "/bass-filter [gain]",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId, options } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
            if (validate) return;

            let bass_gain = options.getNumber("gain")
            FiltersSettings.custombassboost = `bass=g=${bass_gain},dynaudnorm=f=200`;
            client.distube.filters = FiltersSettings;

            await newQueue.filters.set(["custombassboost"]);
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
} catch (e) { toError(e, null, 0, false) }