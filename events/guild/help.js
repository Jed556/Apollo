const
    { EmbedBuilder } = require('discord.js'),
    { mainDir, PG } = require('../../system/functions'),
    emb = require('../../config/embed.json');

// Variable checks (Use .env if present)
require('dotenv').config();
let DefaultCooldown, OwnerID;
if (process.env.defaultCooldown, process.env.ownerID) {
    OwnerID = process.env.ownerID;
    DefaultCooldown = process.env.defaultCooldown * 1000;
} else {
    const { defaultCooldown, ownerID } = require('../../config/client.json');
    OwnerID = ownerID;
    DefaultCooldown = defaultCooldown * 1000;
}

module.exports = {
    name: "interactionCreate",
    on: true,

    run: async (client, interaction) => {
        if (interaction.isStringSelectMenu() && interaction.customId === 'help-category') {
            const category = interaction.values;
            let data = [];
            (await PG(`${mainDir()}/commands/${category}/*.js`)).map(async file => {
                let command = require(file);
                const L = file.split("/");
                const fileName = L[L.length - 1];
                const perms = command.permissions ? command.permissions.map(p => `\`${p}\``).join(', ') : null;
                const users = command.allowedUIDs ? command.allowedUIDs.map(u => `<@${u}>`).join(', ') : null;
                const cooldown = command.cooldown || DefaultCooldown;
                const how = command.help || "No guide";
                data.push(
                `**${command.name}**
                ${command.description.split(" | ")[1] || command.description}
                • **Usage:** \`${how}\`
                • **Permissions:** ${perms || "None"}
                • **Allowed Users:** ${users || "@everyone"}
                • **Cooldown:** ${cooldown}
                `)
            })

            const embed = new EmbedBuilder()
                .setTitle(`${category} Commands`)
                .setDescription(`${data.join("\n")}`)
                .setFooter({ text: `${data.length} Commands` })
                .setColor(emb.color)
                .setTimestamp();
            interaction.update({ embeds: [embed], ephemeral: true })
        }
    }
}