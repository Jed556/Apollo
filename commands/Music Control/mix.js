const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("mix")
            .setDescription("Plays a defined mix")
            .setDefaultMemberPermissions()
            .setDMPermission(false)
            .addStringOption(option => option
                .setName("playlist")
                .setDescription("Music mix")
                .setRequired(true)
                .addChoices(
                    { name: "Blues Mix", value: "Blues" },
                    { name: "Charts Mix", value: "Charts" },
                    { name: "Chill Mix", value: "Chill" },
                    { name: "Default Mix", value: "Default" },
                    { name: "Heavymetal Mix", value: "Heavymetal" },
                    { name: "Gaming Mix", value: "Gaming" },
                    { name: "Jazz Mix", value: "Jazz" },
                    { name: "Metal Mix", value: "Metal" },
                    { name: "Magic Music Mix", value: "Magic Music" },
                    { name: "NCS Mix", value: "NCS" },
                    { name: "Old Gaming Mix", value: "Old Gaming" },
                    { name: "Pop Mix", value: "Pop" },
                    { name: "Remixes Mix", value: "Remixes" },
                    { name: "Rock Mix", value: "Rock" },
                    { name: "Strange-Fruits Mix", value: "Strange Fruits" }
                )
            ),
        help: "/mix [playlist]",
        cooldown: 2,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const
                { member, channelId, guildId } = interaction,
                { guild } = member,
                { channel } = member.voice;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing", "DJ"]);
            if (validate) return;

            let mix = interaction.options.getString("playlist"),
                link, mixName;
            switch (mix) {
                case "NCS":
                    mixName = "NCS";
                    link = "https://open.spotify.com/playlist/7sZbq8QGyMnhKPcLJvCUFD";
                    break;

                case "Pop":
                    link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";
                    break;

                case "Default":
                    link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";
                    break;

                case "Remixes":
                    link = "https://www.youtube.com/watch?v=NX7BqdQ1KeU&list=PLYUn4YaogdahwfEkuu5V14gYtTqODx7R2"
                    break;

                case "Rock":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U";
                    break;

                case "Old Gaming":
                    link = "https://www.youtube.com/watch?v=iFOAJ12lDDU&list=PLYUn4YaogdahPQPTnBGCrytV97h8ABEav";
                    break;

                case "Gaming":
                    link = "https://open.spotify.com/playlist/4a54P2VHy30WTi7gix0KW6";
                    break;

                case "Charts":
                    link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKvYin_USF1qoJQnIyMAfRxl";
                    break;

                case "Chill":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6";
                    break;

                case "Jazz":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt";
                    break;

                case "Blues":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DXd9rSDyQguIk";
                    break;

                case "Strange Fruits":
                    link = "https://open.spotify.com/playlist/6xGLprv9fmlMgeAMpW0x51";
                    break;

                case "Magic Music":
                    link = "https://www.youtube.com/watch?v=WvMc5_RbQNc&list=PLYUn4Yaogdagvwe69dczceHTNm0K_ZG3P"
                    break;

                case "Metal":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe";
                    break;

                case "Heavymetal":
                    link = "https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe";
                    break;
            }

            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setAuthor({ name: "LOADING MUSIC MIX", iconURL: emb.disc.loading })
                    .setDescription(`**Mix: ${mix}**`)
                ],
                ephemeral: true
            });

            try {
                let queue = client.distube.getQueue(guildId),
                    options = { member: member, };
                if (!queue) options.textChannel = guild.channels.cache.get(channelId);
                await client.distube.play(channel, link, options);
            } catch (e) {
                console.log(e.stack ? e.stack : e)
                interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setTimestamp()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "AN ERROR OCCURED", iconURL: emb.disc.error })
                        .setDescription(`\`/info support\` for support or DM me \`${client.user.tag}\` \`\`\`${e}\`\`\``)
                    ],
                    ephemeral: true
                });
            }

            //Edit the reply
            interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setAuthor({ name: "LOADED MUSIC MIX", iconURL: emb.disc.done })
                    .setDescription(`**NOW PLAYING: ${args[0] ? args[0] : "DEFAULT"}**`)
                ],
                ephemeral: true
            });
        }
    }
} catch (e) { toError(e) }