const { MessageEmbed, Collection } = require("discord.js");
const emb = require("../../config/embed.json");

module.exports = async (client, interaction) => {

    // Check if under maintenance
    if (client.maintenance && interaction.user.id != OwnerID) {
        return interaction.reply({
            embeds: [new MessageEmbed()
                .setTimestamp()
                .setColor(emb.errColor)
                .setAuthor({ name: "UNDER MAINTENANCE", iconURL: emb.maintenance.on })
                .setDescription("JavaSkripp will be back soon!")
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
            ],
            ephemeral: true
        })
    }

    // Check if interaction is valid
    if (interaction.isCommand() || interaction.isContextMenu()) {
        // if (!interaction.guild) return

        // Check if command exists
        if (!client.commands.has(interaction.commandName))
            return interaction.reply({
                embeds: [new MessageEmbed()
                    .setColor(emb.errColor)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setAuthor({ name: "COMMAND ERROR", iconURL: emb.alert })
                    .setDescription(`**Command doesn't exist**`)
                ],
                ephemeral: true
            }) && client.commands.delete(interaction.commandName);

        const command = client.commands.get(interaction.commandName)

        // Check if command is in cooldown
        try {
            if (!cooldowns.has(command.name)) { cooldowns.set(command.name, new Collection()); }

            const now = Date.now();
            const timestamps = cooldowns.get(command.name);
            const cooldownAmount = command.cooldown || (500);

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return interaction.reply({
                        embeds: [new MessageEmbed()
                            .setColor(emb.errColor)
                            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                            .setAuthor({ name: "IN COOLDOWN", iconURL: emb.alert })
                            .addField("Command", `\`${command.name}\``, true)
                            .addField("Time left", `${timeLeft.toFixed(1)} second${timeLeft.toFixed(1) != 1 ? "s" : ""}`, true)
                        ],
                        ephemeral: true
                    })
                }
            }
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            if (command.permissions) {
                if (!interaction.member.permissions.has(command.permissions)) {
                    return interaction.reply({
                        embeds: [new MessageEmbed()
                            .setTimestamp()
                            .setColor(emb.errColor)
                            .setAuthor({ name: "NO PERMISSION", iconURL: emb.error })
                            .setDescription(`**An error occured while running command**`)
                            .addField(`Permission${command.permissions.length > 1 ? "s" : ""}`, command.permissions.map(p => `\`${p}\``).join(', '))
                            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        ],
                        ephemeral: true
                    })
                }
            }

            // ---------- TO BE ADDED SOON ---------- //
            // // If Command has specific needed roles return error
            // if (command.requiredroles && command.requiredroles.length > 0 && interaction.member.roles.cache.size > 0 && !interaction.member.roles.cache.some(r => command.requiredroles.includes(r.id))) {
            //     return interaction.reply({
            //         embeds: [new MessageEmbed()
            //             .setTimestamp()
            //             .setColor(emb.errColor)
            //             .setAuthor("Invalid Role", emb.noRole)
            //             .addField("Required Roles", `${(command && command.requiredroles) ? command.requiredroles.map(v => `<@&${v}>`).join(",") : command.requiredroles}`)
            //             .setFooter(client.user.username, client.user.displayAvatarURL())
            //         ],
            //         ephemeral: true
            //     })
            // }

            // // If Command has specific users return error
            // if (command.alloweduserids && command.alloweduserids.length > 0 && !command.alloweduserids.includes(interaction.member.id)) {
            //     return interaction.reply({
            //         embeds: [new MessageEmbed()
            //             .setTimestamp()
            //             .setColor(emb.errColor)
            //             .setAuthor("Invalid User", emb.invalidUser)
            //             .addField("Allowed Users", `${(command && command.alloweduserids) ? command.alloweduserids.map(v => `<@${v}>`).join(",") : command.alloweduserids}`)
            //             .setFooter(client.user.username, client.user.displayAvatarURL())
            //         ],
            //         ephemeral: true
            //     })
            // }

            // Run the command
            command.run(client, interaction);

        } catch (e) {
            // Log and return error
            console.log(e);
            await interaction.reply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setAuthor({ name: "COMMAND ERROR", iconURL: emb.error })
                    .setDescription(`**An error occured while running command**`)
                    .addField("Command", command.name)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            })
        }
    }
}