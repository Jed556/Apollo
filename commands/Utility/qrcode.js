const { AttachmentBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const qrc = require('qrcode')

module.exports = {
    name: "qrcode",
    description: "Create a QR code.",
    help: "/qrcode [text]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "text",
            description: "Link/text to convert into QR code",
            type: 3,
            required: true
        }
    ],

    run: async (client, interaction) => {
        const convert = interaction.options.getString("text");
        if (!convert) return interaction.reply({ content: "Please provide a text!", ephemeral: true });

        await interaction.reply({ content: `🛠 Converting... \`\`\`${convert}\`\`\``, ephemeral: true });

        let result = await qrc.toBuffer(convert);
        interaction.channel.send({ files: [new AttachmentBuilder(result, "qrcode.png")], ephemeral: false });
        interaction.editReply({ content: `Converted \`\`\`${convert}\`\`\``, ephemeral: true });
    }
}