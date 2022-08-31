const Discord = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { toError } = require('../../system/functions');
const { loadFiles } = require('../../system/fileLoader');
const { loadCommands } = require('../../handlers/commands');
const { cyanBright, greenBright, yellow, red, bold, dim } = require('chalk');
const emb = require('../../config/embed.json');
const os = require('os');

// Variable checks (Use .env if present)
require('dotenv').config();
let OwnerID
if (process.env.ownerID) {
    OwnerID = process.env.ownerID;
} else {
    const { ownerID } = require('../../config/client.json');
    OwnerID = ownerID;
}

module.exports = {
    name: "ready",
    once: true,

    run: async (client) => {
        try {
            // Load commands
            await loadCommands(client);

            // Check the total number of commands
            let check = [];
            const Files = await loadFiles("commands");
            Files.forEach((file) => { check.push(file) });

            // Login Log
            console.log(`${cyanBright.bold("[INFO]")} Logged in as ${bold(client.user.username) + dim("#" + client.user.tag.split("#")[1])}`);


            // Create log template
            let log = new EmbedBuilder()
                .setTimestamp()
                .setFields([
                    { name: "👾 Discord.js", value: `\`v${Discord.version}\``, inline: true },
                    { name: "🤖 Node", value: `\`${process.version}\``, inline: true },
                    { name: "\u200b", value: "\u200b", inline: true },
                    { name: "💻 Platform", value: `\`${os.platform()}\` \`${os.arch()}\``, inline: true },
                    { name: "⚙ Loaded", value: `\`${client.commands.size}/${check.length} Commands\``, inline: true },
                    { name: "\u200b", value: "\u200b", inline: true }
                ])
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })

            // Send log to admin/s
            if (client.commands.size < check.length) {
                // Throw error if there are commands missing
                client.users.fetch(OwnerID, false).then((user) => {
                    user.send({
                        embeds: [log
                            .setColor(emb.errColor)
                            .setTitle(`${client.user.username} | Load Error`)
                        ]
                    });
                });
                client.user.setActivity(`Redeploys • ERROR`, { type: "WATCHING" });
            } else {
                // Success log
                client.users.fetch(OwnerID, false).then((user) => {
                    user.send({
                        embeds: [log
                            .setColor(emb.okColor)
                            .setTitle(`${client.user.username} Online!`)
                        ]
                    });
                });
            }
        } catch (e) {
            console.log(toError(e, "Status Error"))
        }
    }
}