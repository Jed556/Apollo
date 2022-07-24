const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const FiltersSettings = require('../../config/filters.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    name: "speed-filter",
    description: "Changes the speed of the song",
    help: "/speed-filter [speed]",
    cooldown: 2,
    permissions: [],
    allowedUIDs: [],
    options: [
        {
            name: "speed",
            description: "Speed percentage to set",
            type: 3,
            required: true,
            choices: [
                { name: "25", value: "0.25" },
                { name: "50", value: "0.50" },
                { name: "75", value: "0.75" },
                { name: "100", value: "1" },
                { name: "125", value: "1.25" },
                { name: "150", value: "1.50" },
                { name: "175", value: "1.75" },
                { name: "200", value: "2" },
            ]
        }
    ],
    category: "music",

    run: async (client, interaction) => {
        const { member, guildId, options } = interaction;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
        if (validate) return;

        let speed_amount = options.getString("speed");

        FiltersSettings.customspeed = `atempo=${speed_amount}`;
        client.distube.filters = FiltersSettings;
        //add old filters so that they get removed 	
        //if it was enabled before then add it
        if (newQueue.filters.includes("customspeed")) {
            await newQueue.setFilter(["customspeed"]);
        }

        await newQueue.setFilter(["customspeed"]);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.color)
                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: `SPEED SET TO ${speed_amount}`, iconURL: emb.disc.filter.set })
            ]
        });
    }
}