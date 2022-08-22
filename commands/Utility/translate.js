const { EmbedBuilder, } = require('discord.js');
const emb = require('../../config/embed.json');
const translate = require('translate-google');
const ISO6391 = require('iso-639-1');

module.exports = {
    name: "translate",
    description: "Translates a text",
    help: "/translate [text] [to] (from)",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "text",
            description: "Text to translate",
            type: 3,
            required: true,
        },
        {
            name: "to",
            description: "Language to translate the text into",
            type: 3,
            required: true,
        },
        {
            name: "from",
            description: "Language to translate the text from",
            type: 3,
            required: false,
        }
    ],

    run: async (client, interaction) => {
        await interaction.deferReply({ content: "Translating", ephemeral: true });

        const text = interaction.options.getString("text");
        const fromlanguage = interaction.options.getString("from");
        const tolanguage = interaction.options.getString("to");
        const Embed = new EmbedBuilder()

        const fromlanguageName = ISO6391.getName(fromlanguage) || fromlanguage || "Automatic Language Search";
        const tolanguageName = ISO6391.getName(tolanguage) || tolanguage;

        await translate(text, { from: fromlanguage, to: tolanguage }).then((result) => {
            interaction.editReply({
                embeds: [Embed
                    .setColor(emb.color)
                    .setAuthor({
                        name: "Text Translated",
                        iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/2048px-Google_Translate_logo.svg.png",
                    })
                    .setDescription(`**From:** ${fromlanguageName}\n**Into:** ${tolanguageName}`)
                    .addFields(
                        {
                            name: `Your text:`,
                            value: `${text}`,
                        },
                        {
                            name: `Translated text:`,
                            value: `${result}`,
                        }
                    )
                ]
            });
        }).catch(e => {
            if (String(e).includes("not supported"))
                interaction.editReply({
                    embeds: [Embed
                        .setColor(emb.errColor)
                        .setAuthor({
                            name: "Error Translating",
                            iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/2048px-Google_Translate_logo.svg.png",
                        })
                        .setDescription(`Failed to translate from **${fromlanguageName}** to **${tolanguageName}**
                        \`\`\`${String(e).substring(7)}\`\`\`
                        [See Language list](https://cloud.google.com/translate/docs/languages)
                        `)
                    ]
                });
        })
    },
};