const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("shuffle-queue")
            .setDescription("Shuffles (Mixes) the queue")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/shuffle-queue",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const { member, guildId } = interaction;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
            if (validate) return;

            client.maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
            await newQueue.shuffle();
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: `SHUFFELED  ${newQueue.songs.length} SONGS`, iconURL: emb.disc.shuffle })
                ]
            });
        }
    }
} catch (e) { toError(e) }