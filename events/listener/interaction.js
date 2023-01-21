
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

        const
            subCommand = "",
            commandName = interaction.commandName;
        try {
            subCommand = interaction.options.getSubcommand() + " ";
        } catch { }

        const guild = interaction.guild.name;
        const channel = interaction.channel.name;
        console.log(`${blurple(`[${guild} in #${channel} from ${interaction.user.tag}]`)} ${bold("Command:")} /${commandName} ${subCommand}`);
    }
}