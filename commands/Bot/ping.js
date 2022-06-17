module.exports = {
    name: "ping",
    usage: "/ping",
    description: "PING",
    permissions: 'SEND_MESSAGES',

    async execute(interaction, client) {
        interaction.reply("ping!");
    }
}