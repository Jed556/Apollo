
const
    config = require('../../config/client.json'),
    { cyanBright, greenBright, yellow, red, bold, dim } = require('chalk'),
    chalk = require('chalk'),
    blurple = chalk.bold.hex("#7289da");

module.exports = {
    name: "interactionCreate",
    on: true,
    run: async (client, interaction) => {
        if (!config.listener.interaction) return;

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