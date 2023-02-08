// REQUIRE DEPENDENCIES
const
    { EmbedBuilder } = require('discord.js'),
    { cyanBright, greenBright, yellow, red, dim } = require('chalk'),
    { promisify } = require('util'),
    { glob } = require('glob');

// ---------- FUNCTIONS ---------- //

/**
 * 
 * @returns promisify(glob) shortcut
 */
const PG = promisify(glob);

/**
 * 
 * @returns Client's root directory
 */
function mainDir() {
    return reSlash(process.cwd());
}

/**
 * 
 * @param {string} string
 * @returns Replaces "\" with "/"
 */
function reSlash(string) {
    return string.replace(/\\/g, '/');
}

/**
 * 
 * @param {*} min Number | Minimum number
 * @param {*} max Number | Maximum number
 * @returns Random number
 */
function randomNum(min, max) {
    try {
        let number;
        if (min || max) {
            number = Math.round(Math.random() * (max - min)) + min;
        } else {
            number = Math.round(Math.random());
        }
        return number;
    } catch (e) { }
}

/**
 * 
 * @param {*} delayInms Number | Time in Milliseconds
 * @returns Promise, waiting for the given Milliseconds
 */
function delay(delayInms) {
    try {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(2);
            }, delayInms);
        });
    } catch (e) {
        toError(e, null, 0, false);
    }
}

/**
 * 
 * @param {*} str String
 * @returns Formatted string
 */
function escapeRegex(str) {
    try {
        try {
            return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
        } catch {
            return str;
        }
    } catch (e) {
        toError(e, null, 0, false);
    }
}

/**
 * 
 * @param {*} str String
 * @returns String in title case
 */
function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

/**
 * 
 * @param {*} error Thrown error
 * @param {String} message Message to display before the error
 * @param {Number} lines Number of lines to display
 * @param {Boolean} string Return string only
 * @returns A console log and formatted error string
 */
function toError(error, message, lines, string) {
    const
        alert = red.bold("[ERROR]") + " ",
        err = error ? error.stack ? error.stack : error : "",
        tab = " ".repeat(8);
    let log;

    if (message && lines && err)
        log = alert + message + err.split("\n", lines).map(l => `\n${tab + l}`).join("");
    else if (message && err)
        log = alert + message + err.split("\n").map(l => `\n${tab + l}`).join("");
    else if (lines && err)
        log = alert + err.split("\n", lines).map(l => `${l}\n${tab}`).join("");
    else if (err)
        log = alert + err.split("\n").map(l => `${l}\n${tab}`).join("");
    else if (message)
        log = alert + message;
    else
        log = alert + "Unknown Error";

    if (string)
        return log;
    else
        return console.log(log);
}

/**
 * 
 * @param {*} message Message to log
 * @param {*} type Type of log ( 1 / "info", 2 / "success", 3 / "warn" )
 * @param {Boolean} string Return string only
 * @returns A console log and formatted string
 */
function toLog(message, type, string) {
    let log = "";

    type = type.toLowerCase();
    switch (type) {
        case 1 || "info":
            log = cyanBright.bold("[INFO]") + " " + message;
            break;

        case 2 || "success":
            log = greenBright.bold("[DONE]") + " " + message;
            break;

        case 3 || "warn":
            log = yellow.bold("[WARN]") + " " + message;
            break;

        case 0 || "":
            log = red.bold("[ERROR]") + " toLog: No Log Message";
            break;

        default:
            log = red.bold("[ERROR]") + " toLog: Unknown Log Format";
            break;
    }

    if (string)
        return log;
    else
        return console.log(log);
}

/**
 * 
 * @param {*} client Discord client
 * @param {*} interaction Discord interaction
 * @param {*} error Error log
 * @param {Boolean} reply Should reply to user
 * @param {Boolean} custom Is a custom interaction
 * @returns 
 */
function eventErrorSend(client, interaction, error, reply, custom) {
    const
        { member, guildId, channel, customId, commandName } = interaction,
        { guild } = member;

    const
        // Setup dynamic vars
        err = error.stack ? error.stack : error,
        action = custom ? customId : client.commands.get(commandName),
        actionMsg = custom ? `ID: \`${action}\`` : `\`/${action}\``,
        actionFoot = custom ? `ID: ${action}` : `/${action}`,
        message = `An error occured ${custom ? "during interaction" : "while running command"} `,
        // Setup message
        errorEmb = new EmbedBuilder()
            .setTimestamp()
            .setColor(emb.errColor)
            .setAuthor({ name: "AN ERROR OCCURED", iconURL: action.category == "music" ? emb.disc.error : emb.error });

    // Log error
    toError(error, custom ? "Interaction Error: " : "Command Error: ");

    if (reply) {
        // Send error to channel
        interaction.channel.send({
            embeds: [errorEmb
                .setFooter({ text: actionFoot, iconURL: client.user.displayAvatarURL() })
                .setDescription(message + ` \`/${interaction.customId}\` \`\`\`${err}\`\`\``)
            ],
            ephemeral: true
        });
    }

    // Send error to DM
    client.users.fetch(OwnerID, false).then((user) => {
        user.send({
            embeds: [errorEmb
                .setFooter({ text: `${guild.name} #${channel.name}`, iconURL: guild.iconURL({ dynamic: true }) })
                .setDescription(message + `${actionMsg}\nat **${guild.name}** (\`${guildId}\`) **#${channel.name}** (\`${channel.id}\`) \`\`\`${err}\`\`\``)
            ]
        });
    });

    return 1;
}

// EXPORT ALL FUNCTIONS
module.exports = {
    PG,
    mainDir,
    reSlash,
    randomNum,
    delay,
    escapeRegex,
    toTitleCase,
    toError,
    toLog,
    eventErrorSend
}