const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const fs = require('fs');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("help")
            .setDescription("Lists all commands")
            .setDefaultMemberPermissions()
            .setDMPermission(true),
        help: "/help",
        cooldown: 2,
        allowedUIDs: [],

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
} catch (e) { }