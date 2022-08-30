const Discord = require('discord.js');
const { EmbedBuilder, ActivityType } = require('discord.js');
const { loadFiles } = require('../../system/fileLoader');
const os = require('os');
const { cyanBright, greenBright, yellow, red, bold, dim } = require('chalk');
const { randomNum } = require('../../system/functions');
const emb = require('../../config/embed.json')
const DB = require('../../schemas/Status');

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
            // Check the total number of commands
            var check = [];
            const Files = await loadFiles("commands");
            Files.forEach((file) => { check.push(file) });

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

            // Load stuff
            setTimeout(() => {
                console.log(`${cyanBright.bold("[INFO]")} Logged in as ${bold(client.user.username) + dim("#" + client.user.tag.split("#")[1])}`);
            }, 1)

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

                // Client Activity
                const initialStatus = setTimeout(() => {
                    client.user.setPresence({
                        activities: [{ name: `Initalizing...`, type: "WATCHING" }],
                        status: "idle"
                    });
                });

                setTimeout(() => {
                    setInterval(() => {
                        updateStatus(client);
                    }, 5000);
                }, randomNum(1, 5)) // randTime is a random number between 1 and 5 seconds
            }
        } catch (e) {
            console.log(String(e.stack))
        }
    }
}

/**
* @param {*} client Discord Client
* @returns Bot Status
*/
async function updateStatus(client) {
    try {
        // Find matching database data
        const docs = await DB.findOne({
            _id: client.user.id,
        });

        if (!docs.maintenance) { // Check if under maintenance
            client.user.setStatus("online");
            const Guilds = client.guilds.cache.size;
            const Users = client.users.cache.filter(user => !user.bot).size;
            let display = randomNum(1, 5)
            console.log(display)

            switch (display) {
                // Set status as guild count
                case 0:
                    if (Guilds > 1 || Guilds < 1) {
                        client.user.setActivity(`${Guilds} Servers`,
                            { type: ActivityType.Listening });
                    } else {
                        client.user.setActivity(`${Guilds} Server`,
                            { type: ActivityType.Listening });
                    }
                    break;

                // Set status as user count
                case 1:
                    if (Users > 999) {
                        client.user.setActivity(`${Math.ceil(Users / 1000)}K Members`,
                            { type: ActivityType.Listening });
                    } else if (Users > 1 || Users < 1) {
                        client.user.setActivity(`${Math.ceil(Users)} Members`,
                            { type: ActivityType.Listening });
                    } else {
                        client.user.setActivity(`${Math.ceil(Users)} Member `,
                            { type: ActivityType.Listening });
                    }
                    break;

                // Set status as random 1
                case 2:
                    client.user.setActivity(`Slash Commands`,
                        { type: ActivityType.Watching });
                    break;

                // Set status as random 2
                case 3:
                    client.user.setActivity(`my DMs ✉`,
                        { type: ActivityType.Watching });
                    break;

                // Set status as RAM usage
                case 4:
                    // Calculate memory usage
                    const memPerc = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

                    client.user.setActivity(`RAM: ${memPerc}%`,
                        { type: ActivityType.Watching });
                    break;

                // Set status as CPU usage
                case 5:
                    const cpus = os.cpus();
                    const cpu = cpus[0];

                    // Accumulate every CPU times values
                    const total = Object.values(cpu.times)
                        .reduce((acc, tv) => acc + tv, 0);

                    // Calculate the CPU usage
                    const usage = process.cpuUsage();
                    const currentCPUUsage = (usage.user + usage.system) * 1000;
                    const cpuPerc = currentCPUUsage / total * 100;

                    client.user.setActivity(`CPU: ${(cpuPerc / 1000).toFixed(1)}%`,
                        { type: ActivityType.Watching });
                    break;
            }
        } else {
            // Set status as under maintenance
            client.user.setStatus("dnd");
            client.user.setActivity(`MAINTENANCE`, { type: ActivityType.Watching });
        }
    } catch (e) {
        console.log(String(e.stack));
    }
}