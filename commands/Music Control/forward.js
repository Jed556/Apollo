const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("forward-song")
            .setDescription("Forwards for X Seconds")
            .setDefaultMemberPermissions()
            .setDMPermission(false)
            .addIntegerOption(option => option
                .setName("seconds")
                .setDescription("Number of seconds to go forward")
                .setRequired(true)
            ),
        help: "/forward-song [seconds]",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId, options } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
            if (validate) return;

            let seekNumber = options.getInteger("seconds");
            let seektime = newQueue.currentTime + seekNumber;
            if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;

            await newQueue.seek(seektime);
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: `FORWARDED FOR ${seekNumber} SECONDS`, iconURL: emb.disc.forward })
                ]
            });
        }
    }
} catch (e) { toError(e, null, 0, false) }