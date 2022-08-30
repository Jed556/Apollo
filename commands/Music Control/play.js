const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const emb = require('../../config/embed.json');
const { distubeValidate } = require('../../system/distubeFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays a song/playlist in your voice channel")
        .setDefaultMemberPermissions()
        .setDMPermission(false)
        .addStringOption(option => option
            .setName("song")
            .setDescription("Song to play")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("mode")
            .setDescription("Skip: Skips the current song | Top: Adds the song to the top")
            .setRequired(false)
            .addChoices(
                { name: "Skip", value: "skip" },
                { name: "Top", value: "top" }
            )
        ),
    help: "/play [song] (mode)",
    cooldown: 2,
    allowedUIDs: [],
    category: "music",

    run: async (client, interaction) => {
        const { member, channelId, guildId, options } = interaction;
        const { guild } = member;
        const { channel } = member.voice;
        let newQueue = client.distube.getQueue(guildId);
        const mode = interaction.options.getString("mode") || false;

        const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"], [{ name: "playing", value: mode }, { name: "userLimit", value: mode }]);
        if (validate) return;

        const Text = options.getString("song");
        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setAuthor({ name: "SEARCHING", iconURL: emb.disc.spin })
                .setDescription(`Song: **${Text}**`)
            ],
            ephemeral: true
        });

        let queue = client.distube.getQueue(guildId);
        let response, icon, playOptions = {};
        switch (mode) {
            case "skip":
                response = "SKIPPED TO SONG"
                icon = emb.disc.skip;
                playOptions = { member: member, skip: true };
                break;

            case "top":
                response = "SONG ADDED TO TOP";
                icon = emb.disc.song.add;
                playOptions = { member: member, position: 1 };
                break;

            default:
                response = "ADDED TO QUEUE";
                icon = emb.disc.song.add;
                playOptions = { member: member };
        }
        if (!queue) playOptions.textChannel = guild.channels.cache.get(channelId);
        await client.distube.play(channel, Text, playOptions);

        // Edit the reply
        interaction.editReply({
            embeds: [new EmbedBuilder()
                .setAuthor({ name: response, iconURL: icon })
                .setDescription(`Song: **${Text}**`)
            ],
            ephemeral: true
        });
    }
}