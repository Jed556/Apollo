const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "loop-queue",
    description: "Set or disable a loop",
    help: "loop-queue [loop]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "loop",
            description: "Loop to disable or enable",
            type: 3,
            required: true,
            choices: [
                { name: "Disable", value: "0" },
                { name: "Song Loop", value: "1" },
                { name: "Queue Loop", value: "2" },
            ]
        }
    ],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId, options } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        // Get selected loop and current loop
        let oldLoop = newQueue.repeatMode;
        let loop = Number(options.getString("loop"));

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