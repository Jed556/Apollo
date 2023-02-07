const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { toError, randomNum } = require('../../system/functions'),
    Scraper = require('images-scraper'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("search-image")
            .setDescription("Send an image to a channel")
            .setDefaultMemberPermissions()
            .setDMPermission(false)
            .addStringOption(option => option
                .setName("image")
                .setDescription("Image to search")
                .setRequired(false)
            ),
        help: "/search-image (image)",
        cooldown: 1,
        allowedUIDs: [],

        run: async (client, interaction) => {
            const
                { member } = interaction,
                search = interaction.options.getString("image");

            const embed = new EmbedBuilder()
                .setAuthor({ name: "Searching...", iconURL: emb.googleIcon })
                .setTimestamp()
                .setColor(emb.color)
                .setDescription(`\`\`\`${search}\`\`\``)
                .setFooter({ text: `Requested by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) });

            interaction.reply({
                embeds: [embed]
            });

            try {
                const google = new Scraper({
                    puppeteer: {
                        headless: true,
                        args: ["--no-sandbox"]
                    },
                    safe: true
                })

                const results = await google.scrape(search, 30);
                await interaction.editReply({
                    embeds: [embed
                        .setAuthor({ name: "Searched", iconURL: emb.googleIcon })
                        .setImage(results[randomNum(0, results.length)].url)
                    ]
                });
            } catch (e) {
                toError(e, null, 0, false);
            }
        }
    }
} catch (e) { toError(e, null, 0, false) }