const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    FiltersSettings = require('../../config/filters.json'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("speed-filter")
            .setDescription("Changes the speed of the song")
            .setDefaultMemberPermissions()
            .setDMPermission(false)
            .addNumberOption(option => option
                .setName("speed")
                .setDescription("Speed percentage to set (25-200)")
                .setRequired(true)
                .setMinValue(25)
                .setMaxValue(200)
            ),
        help: "/speed-filter [speed]",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId, options } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
            if (validate) return;

            let speed_amount = Math.round(options.getNumber("speed") / 100);

            FiltersSettings.customspeed = `atempo=${speed_amount}`;
            client.distube.filters = FiltersSettings;

            await newQueue.filters.set(["customspeed"]);
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: `SPEED SET TO ${speed_amount * 100}`, iconURL: emb.disc.filter.set })
                ]
            });
        }
    }
} catch (e) { toError(e) }