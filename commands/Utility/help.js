const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const fs = require('fs');

module.exports = {
    name: "help",
    description: "Lists all commands",
    help: "/help",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [],

    run: async (client, interaction) => {
        const directories = await fs.readdirSync('commands');

        const row = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('help-category')
                .setPlaceholder('Select a category')
                .addOptions(
                    directories.map(dir => {
                        return {
                            label: dir,
                            value: dir
                        }
                    })
                )
        );

        const embed = new EmbedBuilder()
            .setTitle('Help')
            .setDescription('Select a category')
            .setColor(emb.color)
            .setTimestamp()

        interaction.reply({ embed: embed, components: [row], ephemeral: true });
    }
}