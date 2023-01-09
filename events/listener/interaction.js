
const config = require('../../config/client.json');
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
        console.log(`[${guild} in #${channel} from ${interaction.user.tag}] Command: /${commandName} ${subCommand}`);
    }
}