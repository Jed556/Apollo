const { EmbedBuilder, InteractionType } = require('discord.js');
const emb = require('../../config/embed.json');
const DB = require('../../schemas/Cooldowns');
const { toError } = require('../../system/functions');
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

module.exports = {
    name: "interactionCreate",
    on: true,

    run: async (client, interaction) => {
        if (!interaction.isChatInputCommand()) return; // Return if not a chat input
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

        // Check if command exists
        const command = client.commands.get(interaction.commandName);
        if (!command)
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "COMMAND ERROR", iconURL: emb.alert })
                    .setDescription(`**Command doesn't exist or outdated**`)
                ],
                ephemeral: true
            })

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

        // !! v14 has its own permission safeguard !! //

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
            console.log(toError(e, "Command Error"));
            const errorEmb = new EmbedBuilder()
                .setTimestamp()
                .setColor(emb.errColor)
                .setAuthor({ name: "AN ERROR OCCURED", iconURL: command.category == "music" ? emb.disc.error : emb.error })

            interaction.channel.send({
                embeds: [errorEmb
                    .setFooter({ text: "/" + command.name, iconURL: client.user.displayAvatarURL() })
                    .setDescription(`**An error occured while running command \`${command.name}\`**\`\`\`${e.stack ? e.stack : e}\`\`\``)
                ],
                ephemeral: true
            });
            client.users.fetch(OwnerID, false).then((user) => {
                user.send({
                    embeds: [errorEmb
                        .setFooter({ text: `${guild.name} : ${channel.name}`, iconURL: guild.iconURL({ dynamic: true }) })
                        .setDescription(`**An error occured while running command \`${command.name}\`\nat ${guild.name} (\`${guildId}\`) - ${channel.name} (\`${channel.id}\`) **\`\`\`${e.stack ? e.stack : e}\`\`\``)
                    ]
                });
            });
        });
    }
}