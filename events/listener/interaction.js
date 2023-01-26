
const
    { cyanBright, greenBright, yellow, red, bold, dim } = require('chalk'),
    chalk = require('chalk'),
    blurple = chalk.bold.hex("#7289da");

// Variable checks (Use .env if present)
require('dotenv').config();
let ListenerInteraction;
if (process.env.listenerInteraction) {
    ListenerInteraction = process.env.listenerInteraction;
} else {
    const { listener } = require('../../config/client.json');
    ListenerInteraction = listener
}

module.exports = {
    name: "interactionCreate",
    on: true,
    run: async (client, interaction) => {
        if (!ListenerInteraction) return;


        let subCommand = "";
        try {
            subCommand = interaction.options.getSubcommand() + " ";
        } catch { }

        const
            commandName = interaction.commandName,
            guild = interaction.guild.name,
            guildID = interaction.guild.id,
            channel = interaction.channel.name,
            channelID = interaction.channel.id,
            user = interaction.user.tag,
            userID = interaction.user.id;

        let
            infoStr = blurple(`[${guild} ${dim(`<${guildID}>`)} in #${channel} ${dim(`<${channelID}>`)} from ${user} ${dim(`<${userID}>`)}]`),
            cmdStr = bold("Command:") + ` /${commandName} ${subCommand}`;

        if (!interaction.isChatInputCommand())
            console.log(`${infoStr} ${interaction.customId ? `${bold("Interaction ID:")} ${interaction.customId}` : bold("Component Interaction")}`);
        else
            console.log(`${infoStr} ${cmdStr} `);
    }
}