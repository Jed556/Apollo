const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("rewind-song")
            .setDescription("Rewinds for X seconds")
            .setDefaultMemberPermissions()
            .setDMPermission(false)
            .addNumberOption(option => option
                .setName("seconds")
                .setDescription("Number of seconds to rewind")
                .setRequired(true)
            ),
        help: "/rewind-song [seconds]",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId, options } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
            if (validate) return;

            let seekNumber = options.getInteger("seconds"),
                seektime = newQueue.currentTime - seekNumber;
            if (seektime < 0) seektime = 0;
            if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;

            await newQueue.seek(seektime);
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: `REWINDED FOR ${seekNumber} SECONDS`, iconURL: emb.disc.rewind })
                ]
            });
        }
    }
} catch (e) { toError(e) }