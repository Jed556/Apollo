const
    { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js'),
    { toError } = require('../../system/functions'),
    mal = require('mal-scraper'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName('search-anime')
            .setDescription('Search Anime information')
            .setDefaultMemberPermissions()
            .setDMPermission(true)
            .addStringOption(option =>
                option
                    .setName('query')
                    .setDescription('Anime name')
                    .setRequired(true),
            ),
        help: "/search-anime (query)",
        cooldown: 1,
        allowedUIDs: [],

        run: async (client, interaction) => {
            const search = interaction.options.getString('query');
            await interaction.deferReply();

            mal
                .getInfoFromName(search)
                .then((data) => {
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: `My Anime List search result for ${search}` })
                        .setImage(data.picture)
                        .setColor(emb.color)
                        .addFields(
                            { name: 'English Title', value: `${data.englishTitle || 'None!'}` },
                            { name: 'Japanese Title', value: `${data.japaneseTitle || 'None!'}` },
                            { name: 'Type', value: `${data.type || 'N/A!'}` },
                            { name: 'Episodes', value: `${data.episodes || 'N/A!'}` },
                            { name: 'Score', value: `${data.score || 'N/A!'}` },
                            { name: 'Rating', value: `${data.rating || 'N/A!'}` },
                            { name: 'Aired', value: `${data.aired || 'N/A!'}` },
                            { name: 'Scored by', value: `${data.scoreStats || 'N/A!'}` },
                        )
                        .setFooter({
                            text: `Requested by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true, }),
                        })
                        .setTimestamp();

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setURL(data.url)
                                .setLabel('View more'),
                        );

                    interaction.followUp({ embeds: [embed], components: [row] });
                });
        }
    }
} catch (e) { toError(e, null, 0, false) }