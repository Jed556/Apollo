const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "volume-song",
    description: "Adjusts the volume of the music",
    help: "/volume-song [percent]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "percent",
            description: "Volume to set in percent (0 - 150)",
            type: 4,
            required: true,
        }
    ],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId, options } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "DJ"]);
        if (validate) return;

        let volume = options.getInteger("percent");
        let oldVolume = newQueue.volume;

        if (volume > 150 || volume < 0) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: `VOLUME ${volume > 150 ? "TOO HIGH" : ""}${volume < 0 ? "TOO LOW" : ""}`, iconURL: emb.disc.alert })
                .setDescription(`**Volume must be from 0 to 150`)
            ],
            ephemeral: true
        });

        if (volume == oldVolume) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setAuthor({ name: `VOLUME IS ALREADY SET TO ${volume}}`, iconURL: emb.disc.alert })
            ],
            ephemeral: true
        });

        await newQueue.setVolume(volume);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: `${(oldVolume > volume) ? "INCREASED" : "DECREASED"} VOLUME TO ${volume}`, iconURL: emb.disc.alert })
            ]
        });
    }
}