const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("previous-song")
            .setDescription("Plays the previous song")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/previous-song",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId, } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "previous", "DJ"]);
            if (validate) return;

            await newQueue.previous();
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: "PLAYING PREVIOUS SONG", iconURL: emb.disc.previous })
                ]
            });
        }
    }
} catch (e) { toError(e) }