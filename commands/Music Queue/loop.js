const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop-queue")
        .setDescription("Set or disable a loop")
        .setDefaultMemberPermissions()
        .setDMPermission(false)
        .addNumberOption(option => option
            .setName("loop")
            .setDescription("Toggle between loops")
            .addChoices(
                { name: "Disable", value: 0 },
                { name: "Song Loop", value: 1 },
                { name: "Queue Loop", value: 2 }
            )
        ),
    help: "/loop-queue",
    cooldown: 2,
    allowedUIDs: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId, options } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        // Get selected loop and current loop
        let oldLoop = newQueue.repeatMode;
        let loop = options.getNumber("loop");

        // Set embed template
        let embed = new EmbedBuilder()
            .setTimestamp()
            .setColor(emb.color)
            .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })

        // Return reply if loop is already active
        if (oldLoop == loop)
            return interaction.reply({
                embeds: [embed
                    .setColor(emb.errColor)
                    .setAuthor({ name: "LOOP IS ALREADY ACTIVE", iconURL: emb.disc.alert })
                    .setDescription("The selected loop is already the active loop")
                ],
                ephemeral: true
            });

        // Switch reply according to loop selected
        switch (loop) {
            case 0:
                embed.setAuthor({ name: `DISABLED ${oldLoop == 1 ? "SONG" : "QUEUE"} LOOP`, iconURL: emb.disc.loop.none })
                break;

            case 1:
                embed.setAuthor({ name: `${oldLoop == 0 ? "ENABLED SONG" : "DISABLED QUEUE LOOP & ENABLED SONG"} LOOP`, iconURL: emb.disc.loop.song })
                break;

            case 2:
                embed.setAuthor({ name: `${oldLoop == 0 ? "ENABLED QUEUE" : "DISABLED SONG LOOP & ENABLED QUEUE"} LOOP`, iconURL: emb.disc.loop.queue })
                break;
        }

        // Set loop and send reply
        await newQueue.setRepeatMode(loop);
        return interaction.reply({ embeds: [embed] });
    }
}