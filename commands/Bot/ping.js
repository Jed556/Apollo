module.exports = {
    name: "ping",
    description: "Ping command",
    help: "/ping",
    cooldown: 1,
    permissions: [],
    options: [],

    run: async (client, interaction) => {
        interaction.reply("ping!");
    }
}