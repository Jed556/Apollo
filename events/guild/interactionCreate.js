const { MessageEmbed } = require("discord.js");
const { ownerID } = require("../../config/client.json");
const commands = require("../../handlers/commands");
const emb = require("../../config/embed.json");

let OwnerID = process.env.ownerID || ownerID;

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
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

        // Return if interaction is not in guild
        if (interaction.guildId == null) return;

        // Check if command exists
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command)
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "COMMAND ERROR", iconURL: emb.alert })
                        .setDescription(`**Command doesn't exist**`)
                    ],
                    ephemeral: true
                }) && client.commands.delete(interaction.commandName);
        }

        if (command.permission && !interaction.member.permissions.has(command.permission)) {
            return interaction.reply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setAuthor({ name: "INVALID PERMISSION", iconURL: emb.noPermission })
                    .setDescription(`**An error occured while running command**`)
                    .addField("Command", interaction.commandName)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            })
        }

        try {
            commands.execute(interaction, client);
        } catch (error) {
            console.error(error);
            interaction.reply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setAuthor({ name: "EXECUTION ERROR", iconURL: emb.error })
                    .addField("Command", interaction.commandName)
                    .addField("Required Permissions", `${(command && command.permissions) ? command.memberpermissions.map(v => `\`${v}\``).join(",") : command.memberpermissions}`)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            });
        }
    }
}



/**
 * 
 * @param {*} message A DiscordMessage, with the client, information
 * @param {*} command The Command with the command.name
 * @returns BOOLEAN
 */
function onCoolDown(message, command) {
    // Check for errors
    if (!message || !message.client) throw "No Message with a valid DiscordClient granted as First Parameter";
    if (!command || !command.name) throw "No Command with a valid Name granted as Second Parameter";

    const client = message.client;

    // Set a cooldown if there is no cooldown set
    if (!client.cooldowns.has(command.name)) {
        client.cooldowns.set(command.name, new Collection());
    }

    const now = Date.now(); // Get the current time
    const timestamps = client.cooldowns.get(command.name); // Get the timestamp of last used command
    const cooldownAmount = (command.cooldown || config.defaultCooldown) * 1000; // Get the cooldownamount of the command

    // If the user is on cooldown
    if (timestamps.has(message.member.id)) {
        const expirationTime = timestamps.get(message.member.id) + cooldownAmount; // Cooldown time

        if (now < expirationTime) {
            // If user is still on cooldown
            const timeLeft = (expirationTime - now) / 1000; // Get time left
            return timeLeft
        }
        else {
            // If user is not on cooldown, set a cooldown
            timestamps.set(message.member.id, now);
            setTimeout(() => timestamps.delete(message.member.id), cooldownAmount);
            // Return not on cooldown
            return false;
        }
    }
    else {
        // If user is not on cooldown, set a cooldown
        timestamps.set(message.member.id, now);
        setTimeout(() => timestamps.delete(message.member.id), cooldownAmount);
        // Return not on cooldown
        return false;
    }
}