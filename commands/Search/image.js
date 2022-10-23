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

            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setAuthor(`Searching...`)
                    .setTimestamp()
                    .setColor(emb.color)
                    .setDescription(`\`\`\`${search}\`\`\``)
                    .setFooter({ text: `Requested by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                ]
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
                interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setAuthor(`Searching...`)
                        .setTimestamp()
                        .setColor(emb.color)
                        .setImage(results[randomNum(0, results.length)].url)
                        .setDescription(`\`\`\`${search}\`\`\``)
                        .setFooter({ text: `Requested by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                    ]
                });
            } catch (e) {
                toError(e);
            }
        }
    }
} catch (e) { toError(e) }