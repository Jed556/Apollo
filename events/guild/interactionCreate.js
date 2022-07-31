const { EmbedBuilder, Collection, InteractionType } = require('discord.js');
const emb = require('../../config/embed.json');
const DB = require('../../schemas/Cooldowns');
const { mainDir, PG } = require('../../system/functions');
const { cyanBright, greenBright, yellow, red, dim } = require('chalk');

// Variable checks (Use .env if present)
require('dotenv').config();
let DefaultCooldown, OwnerID;
if (process.env.connectDB, process.env.database, process.env.defaultCooldown, process.env.ownerID) {
    OwnerID = process.env.ownerID;
    ConnectDB = process.env.connectDB;
    Database = process.env.database;
    DefaultCooldown = process.env.defaultCooldown * 1000;
} else {
    const { defaultCooldown, ownerID } = require('../../config/client.json');
    const { connectDB, database } = require('../../config/database.json');
    OwnerID = ownerID;
    ConnectDB = connectDB;
    Database = database;
    DefaultCooldown = defaultCooldown * 1000;
}

module.exports = async (client, interaction) => {
    const { member, guildId, channel } = interaction;
    const { guild } = member;

    // Check if under maintenance
    if (client.maintenance && interaction.user.id != OwnerID) {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setAuthor({ name: "UNDER MAINTENANCE", iconURL: emb.maintenance.on })
                .setDescription(`${client.user.username} will be back soon!`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
            ],
            ephemeral: true
        })
    }

    // Check if interaction is valid
    if (interaction.type === InteractionType.ApplicationCommand) {
        // if (!interaction.guild) return

        // Check if command exists
        if (!client.commands.has(interaction.commandName))
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "COMMAND ERROR", iconURL: emb.alert })
                    .setDescription(`**Command doesn't exist**`)
                ],
                ephemeral: true
            }) && client.commands.delete(interaction.commandName);

        const command = client.commands.get(interaction.commandName)

        // Check if command is in cooldown
        const data = await DB.findOne({
            userId: member.id,
            guildId: guildId,
            command: command.name
        });

        const now = Date.now(); // Get the current time
        const cooldownAmount = command.cooldown * 1000 || DefaultCooldown; // Convert default cooldown to seconds
        const time = now + cooldownAmount; // Get the time before the cooldown expires

        if (data && data.time > now) {
            const timeLeft = (data.time - now) / 1000; // Get time left
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "IN COOLDOWN", iconURL: emb.alert })
                    .setFields([
                        { name: "Command", value: `\`${command.name}\``, inline: true },
                        { name: "Time left", value: `${timeLeft.toFixed(2)} second${Math.round(timeLeft) != 1 ? "s" : ""}` }
                    ])
                ],
                ephemeral: true
            })
        } else {
            await DB.findOneAndUpdate(
                {
                    userId: member.id,
                    guildId: guildId,
                    command: command.name
                },
                { time },
                { upsert: true }
            );
        }

        if (command.permissions) {
            if (!interaction.member.permissions.has(command.permissions)) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTimestamp()
                        .setColor(emb.errColor)
                        .setAuthor({ name: "NO PERMISSION", iconURL: emb.error })
                        .setDescription(`**An error occured while running command**`)
                        .setFields({ name: `Permission${command.permissions.length > 1 ? "s" : ""}`, value: command.permissions.map(p => `\`${p}\``).join(', ') })
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    ],
                    ephemeral: true
                })
            }
        }

        // ---------- MIGHT ADD SOON ---------- //
        // // If Command has specific needed roles return error
        // if (command.requiredroles && command.requiredroles.length > 0 && interaction.member.roles.cache.size > 0 && !interaction.member.roles.cache.some(r => command.requiredroles.includes(r.id))) {
        //     return interaction.reply({
        //         embeds: [new EmbedBuilder()
        //             .setTimestamp()
        //             .setColor(emb.errColor)
        //             .setAuthor("Invalid Role", emb.noRole)
        //             .setFields({name:"Required Roles", value: `${(command && command.requiredroles) ? command.requiredroles.map(v => `<@&${v}>`).join(",") : command.requiredroles}`})
        //             .setFooter(client.user.username, client.user.displayAvatarURL())
        //         ],
        //         ephemeral: true
        //     })
        // }

        // Return error if command has user whitelist
        if (command.allowedUIDs && command.allowedUIDs.length > 0 && !command.allowedUIDs.includes(interaction.member.id)) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setAuthor({ name: "INVALID USER", iconURL: emb.error }) // emb.invalidUser is null
                    .setFields("Allowed Users", `${(command && command.allowedUIDs) ? command.allowedUIDs.map(u => `<@${u}>`).join(",") : command.allowedUIDs}`)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            })
        }

        // Run the command
        command.run(client, interaction).catch(e => {
            console.log(red.bold("[ERROR]") + ` ${e.stack ? e.stack : e}`);
            interaction.channel.send({
                embeds: [new EmbedBuilder()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setFooter({ text: "/" + command.name, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "AN ERROR OCCURED", iconURL: command.category == "music" ? emb.disc.error : emb.error })
                    .setDescription(`**An error occured while running command \`${command.name}\`**\`\`\`${e.stack ? e.stack : e}\`\`\``)
                ],
                ephemeral: true
            });
            client.users.fetch(OwnerID, false).then((user) => {
                user.send({
                    embeds: [new EmbedBuilder()
                        .setTimestamp()
                        .setColor(emb.errColor)
                        .setFooter({ text: `${guild.name} : ${channel.name}`, iconURL: guild.iconURL({ dynamic: true }) })
                        .setAuthor({ name: "AN ERROR OCCURED", iconURL: command.category == "music" ? emb.disc.error : emb.error })
                        .setDescription(`**An error occured while running command \`${command.name}\`\nat ${guild.name} (\`${guildId}\`) - ${channel.name} (\`${channel.id}\`) **\`\`\`${e.stack ? e.stack : e}\`\`\``)
                    ]
                });
            });
        });
    }

    if (interaction.isSelectMenu()) {
        if (interaction.customId === 'help-category') {
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