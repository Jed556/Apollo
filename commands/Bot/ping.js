module.exports = {
    name: "ping",
    description: "Ping command",
    help: "/ping", //OPTIONAL (for the help cmd)
    cooldown: 1, // Default: 2 seconds
    permissions: [],
    options: [],

    run: async (client, interaction) => {
        interaction.reply("ping!");
    }
}