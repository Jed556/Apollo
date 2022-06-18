const { MessageEmbed } = require("discord.js");
const Discord = require("discord.js");
const mongoose = require("mongoose");
const os = require("os");
const osUtils = require("os-utils");
const { readdirSync, lstatSync } = require("fs");
const chalk = require("chalk");
const ms = require("ms");

const { connectDB, database, ownerID } = require("../../config/client.json")
const { randomNum } = require("../../system/functions");
const emb = require("../../config/embed.json")
const DB = require('../../Structures/Schemas/ClientDB');

let OwnerID = process.env.ownerID || ownerID;
let Database = process.env.database || database;

/* ----------[CPU Usage]---------- */
const cpus = os.cpus();
const cpu = cpus[0];

// Accumulate every CPU times values
const total = Object.values(cpu.times).reduce(
    (acc, tv) => acc + tv, 0
);

// Calculate the CPU usage
const usage = process.cpuUsage();
const currentCPUUsage = (usage.user + usage.system) * 1000;
const perc = currentCPUUsage / total * 100;

/* ----------[RAM Usage]---------- */

// Get the process memory usage (in MB)
async function getMemoryUsage() {
    return process.memoryUsage().heapUsed / (1024 * 1024).toFixed(2);
}

module.exports = {
    name: "ready",
    once: true,

    execute(client) {
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

                console.log(`${chalk.cyanBright("[INFO]")} Logged in as ${client.user.tag}`);

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


                if (connectDB) {
                    // Initializing database Connection 
                    if (!Database) return;
                    mongoose.connect(Database, {
                        dbName: "Client",
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    }).then(() => {
                        console.log(`${chalk.cyanBright("[INFO]")} Connected to database!`);
                    }).catch((err) => {
                        console.log(`${chalk.red("[ERROR]")} Not connected to database \n${err}\n`);
                    });
                } else {
                    console.log(`${chalk.yellow("[WARN]")} Database connection disabled`);
                }

                // -------------- Systems -------------- //
                //require("../../Systems/ChatFilterSys")(client);

                // -------------- Events -------------- //

                // Memory Data Update
                if (connectDB) {
                    let memArray = [];

                    setInterval(async () => {

                        //Used Memory in GB
                        memArray.push(await getMemoryUsage());

                        if (memArray.length >= 14) {
                            memArray.shift();
                        }

                        // Store in database
                        await DB.findOneAndUpdate({
                            Client: true,
                        }, {
                            Memory: memArray,
                        }, {
                            upsert: true,
                        });

                    }, ms("5s")); //every 5000 (ms)
                }
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
        if (!client.maintenance) { // Check if under maintenance
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
                client.user.setActivity(`RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}%`, {
                    type: "WATCHING",
                });
            }

            // Set status as CPU usage
            if (display == 5) {
                client.user.setActivity(`CPU: ${(perc / 1000).toFixed(1)}%`, {
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