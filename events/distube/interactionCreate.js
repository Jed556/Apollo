module.exports = (client, interaction) => {
    client.distubeSettings.ensure(interaction.guildId, {
        defaultvolume: 100,
        defaultautoplay: false,
        defaultfilters: ["bassboost6", "clear"],
        djroles: [],
    })
}