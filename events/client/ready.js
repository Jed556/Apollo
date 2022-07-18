const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { readdirSync, lstatSync } = require('fs');
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

module.exports = async (client) => {
    try {
        // Check the total number of commands
        var check = [];
        readdirSync(`./commands`).forEach((dir) => {
            if (lstatSync(`./commands/${dir}`).isDirectory()) {
                const cmd = readdirSync(`./commands/${dir}`).filter((file) => file.endsWith(".js"));
                for (let file of cmd) check.push(file);
            }
        })

        // Create log template
        let log = new MessageEmbed()
            .setTimestamp()
            .addField("👾 Discord.js", `\`v${Discord.version}\``, true)
            .addField("🤖 Node", `\`${process.version}\``, true)
            .addField("\u200b", `\u200b`, true)
            .addField("💻 Platform", `\`${os.platform()}\` \`${os.arch()}\``, true)
            .addField(`⚙ Loaded`, `\`${client.commands.size}/${check.length} Commands\``, true)
            .addField("\u200b", `\u200b`, true)
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

            console.log(`${cyanBright.bold("[INFO]")} Logged in as ${bold(client.user.username) + dim("#" + client.user.tag.split("#")[1])}`);

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

            // Set status as guild count
            if (display == 0) {
                if (Guilds > 1 || Guilds < 1) {
                    client.user.setActivity(`${Guilds} Servers`, {
                        type: "LISTENING",
                    });
                } else {
                    client.user.setActivity(`${Guilds} Server`, {
                        type: "LISTENING",
                    });
                }
            }

            // Set status as user count
            if (display == 1) {
                if (Users > 999) {
                    client.user.setActivity(`${Math.ceil(Users / 1000)}K Members`, {
                        type: "LISTENING",
                    });
                } else if (Users > 1 || Users < 1) {
                    client.user.setActivity(`${Math.ceil(Users)} Members`, {
                        type: "LISTENING",
                    });
                } else {
                    client.user.setActivity(`${Math.ceil(Users)} Member `, {
                        type: "LISTENING",
                    });
                }
            }

            // Set status as random 1
            if (display == 2) {
                client.user.setActivity(`Slash Commands`, {
                    type: "WATCHING",
                });
            }

            // Set status as random 2
            if (display == 3) {
                client.user.setActivity(`my DMs ✉`, {
                    type: "LISTENING",
                });
            }

            // Set status as RAM usage
            if (display == 4) {
                // Calculate memory usage
                const memPerc = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

                client.user.setActivity(`RAM: ${memPerc}%`, {
                    type: "WATCHING",
                });
            }

            // Set status as CPU usage
            if (display == 5) {
                const cpus = os.cpus();
                const cpu = cpus[0];

                // Accumulate every CPU times values
                const total = Object.values(cpu.times).reduce(
                    (acc, tv) => acc + tv, 0
                );

                // Calculate the CPU usage
                const usage = process.cpuUsage();
                const currentCPUUsage = (usage.user + usage.system) * 1000;
                const cpuPerc = currentCPUUsage / total * 100;

                client.user.setActivity(`CPU: ${(cpuPerc / 1000).toFixed(1)}%`, {
                    type: "WATCHING",
                });
            }

        } else {
            // Set status as under maintenance
            client.user.setStatus("dnd");
            client.user.setActivity(`MAINTENANCE`, { type: "WATCHING" });
        }
    } catch (e) {
        console.log(String(e.stack))
    }
}