const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const weather = require('weather-js');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("weather")
            .setDescription("Get weather info")
            .setDefaultMemberPermissions()
            .setDMPermission(true)
            .addStringOption(option => option
                .setName("city")
                .setDescription("City to check weather status")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("country")
                .setDescription("Country to check weather status")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("degree")
                .setDescription("Temperature value")
                .setRequired(true)
                .addChoices(
                    { name: "C", value: "C" },
                    { name: "F", value: "F" }
                )
            ),
        help: "/weather [city] [country] (degree)",
        cooldown: 5,
        allowedUIDs: [],

        run: async (client, interaction) => {
            const
                city = interaction.options.getString("city"),
                country = interaction.options.getString("country"),
                degree = interaction.options.getString("degree") || "C";

            let embed = new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

            weather.find({ search: `${city}, ${country}`, degreeType: degree }, function (err, result) {
                if (err) return console.log(err);
                parseData = JSON.parse(JSON.stringify(result));

                for (let i = 0; i < parseData.length; i++) {
                    var wind = parseData[i].current.winddisplay.split(" ");
                    embed
                        .setAuthor({ name: `WEATHER | ${parseData[0].location.name}` })
                        .setFields([
                            { name: "🏦 Location:", value: `\`Lat: ${parseData[i].location.lat}\nLong:${parseData[i].location.long}\``, inline: true },
                            { name: "⌚ Date:", value: `\`${parseData[i].current.day}\n${parseData[i].current.date}\``, inline: true },
                            { name: "🌡 Temp:", value: `\`${parseData[i].current.temperature}° ${parseData[i].location.degreetype}\``, inline: true },
                            { name: "☁ Sky:", value: `\`${parseData[i].current.skytext}\``, inline: true },
                            { name: "💨 Wind:", value: `\`${wind[0]} ${wind[1]}\n${wind[2]}\``, inline: true },
                            { name: "\u200b", value: `\u200b\n\u200b\n\u200b`, inline: true }
                        ]);
                }
                interaction.reply({ embeds: [embed] });
            });
        }
    };
} catch (e) { }