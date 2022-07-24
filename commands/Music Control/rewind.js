const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "rewind-song",
    description: "Rewinds for X seconds",
    help: "/rewind-song [seconds]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "seconds",
            description: "Number of seconds to rewind",
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

        let seekNumber = options.getInteger("seconds");
        let seektime = newQueue.currentTime - seekNumber;
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