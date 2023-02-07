const
    { AttachmentBuilder, SlashCommandBuilder } = require('discord.js'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json'),
    qrc = require('qrcode');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("qrcode")
            .setDescription("Creates QR code from string")
            .setDefaultMemberPermissions()
            .setDMPermission(true)
            .addStringOption(option => option
                .setName("text")
                .setDescription("Link/text to convert into QR code")
                .setRequired(true)
            ),
        help: "/qrcode [text]",
        cooldown: 2,
        allowedUIDs: [],

        run: async (client, interaction) => {
            const convert = interaction.options.getString("text");
            if (!convert) return interaction.reply({ content: "Please provide a text!", ephemeral: true });

            await interaction.reply({ content: `🛠 Converting... \`\`\`${convert}\`\`\``, ephemeral: true });

            let result = await qrc.toBuffer(convert);
            interaction.channel.send({ files: [new AttachmentBuilder(result, "qrcode.png")], ephemeral: false });
            interaction.editReply({ content: `Converted \`\`\`${convert}\`\`\``, ephemeral: true });
        }
    }
} catch (e) { toError(e, null, 0, false) }