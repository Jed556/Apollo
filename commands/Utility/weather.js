const { MessageEmbed } = require("discord.js");
const emb = require("../../config/embed.json");
const weather = require("weather-js");

module.exports = {
    name: "weather",
    description: "Get weather info",
    help: "/weather",
    cooldown: 5,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "city",
            description: "City to check weather status",
            type: 3,
            required: true
        },
        {
            name: "country",
            description: "City to check weather status",
            type: 3,
            required: true
        },
        {
            name: "degree",
            description: "Temperature value",
            type: 3,
            required: false,
            choices: [
                { name: "C", value: "C" },
                { name: "F", value: "F" }
            ]
        }
    ],

    run: async (client, interaction) => {
        try {
            const city = interaction.options.getString("city");
            const country = interaction.options.getString("country");
            const degree = interaction.options.getString("degree") || "C";

            embed = new MessageEmbed()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })

            weather.find({ search: `${city}, ${country}`, degreeType: degree }, function (err, result) {
                if (err) return console.log(err)
                parseData = JSON.parse(JSON.stringify(result));

                for (let i = 0; i < parseData.length; i++) {
                    var wind = parseData[i].current.winddisplay.split(" ");
                    embed
                        .setAuthor({ name: `WEATHER | ${parseData[0].location.name}` })
                        .addField("🏦 Location:", `\`Lat: ${parseData[i].location.lat}\nLong:${parseData[i].location.long}\``, true)
                        .addField("⌚ Date:", `\`${parseData[i].current.day}\n${parseData[i].current.date}\``, true)
                        .addField("🌡 Temp:", `\`${parseData[i].current.temperature}° ${parseData[i].location.degreetype}\``, true)
                        .addField("☁ Sky:", `\`${parseData[i].current.skytext}\``, true)
                        .addField("💨 Wind:", `\`${wind[0]} ${wind[1]}\n${wind[2]}\``, true)
                        .addField("\u200b", `\u200b\n\u200b\n\u200b`, true)
                }
                interaction.reply({ embeds: [embed] })
            })
        } catch (e) {
            console.log(String(e.stack))
        }
    }
};