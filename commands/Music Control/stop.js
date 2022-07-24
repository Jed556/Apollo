const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "stop-song",
    description: "Stops playing and leaves the channel",
    help: "/stop-song",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) {
            await newQueue.stop();
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: "STOPPED PLAYING", iconURL: emb.disc.stop })
                    .setDescription(`**LEFT THE VOICE CHANNEL**`)
                ]
            });
        } else {
            await newQueue.stop()
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    .setAuthor({ name: "STOPPED PLAYING", iconURL: emb.disc.stop })
                    .setDescription(`**STOPPED THE PLAYER & LEFT THE VOICE CHANNEL**`)
                ]
            });
        }
        return;
    }
}