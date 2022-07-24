const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');

// Variable checks (Use .env if present)
require('dotenv').config();
let OwnerID;
if (process.env.ownerID) {
    OwnerID = process.env.ownerID;
} else {
    const { ownerID } = require('../../config/client.json');
    OwnerID = ownerID;
}

module.exports = {
    name: "say",
    description: "Says something to the current channel",
    help: "/restart [message]",
    cooldown: 1,
    permissions: [],
    allowedUIDs: [OwnerID],
    options: [
        {
            name: "message",
            description: "Message to say",
            type: 3,
            required: true,
        }
    ],

    run: async (client, interaction) => {
        const message = interaction.options.getString("message");
        try {
            interaction.channel.send({ content: message });
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.okColor)
                    .setFields({ name: `Message:`, value: `${message ? `> ${message}` : "\u200b"}` })
                    .setAuthor({ name: "MESSAGE SENT", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            });
        } catch {
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setFields({ name: `Unsent Message:`, value: `${message ? `> ${message}` : "\u200b"}` })
                    .setAuthor({ name: "ERROR SENDING", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            });
        }
    }
}