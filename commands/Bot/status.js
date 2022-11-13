const
    { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder, ChannelType, UserFlags, version } = require('discord.js'),
    { toError } = require('../../system/functions'),
    { ChartJSNodeCanvas } = require('chartjs-node-canvas'),
    { connection } = require('mongoose'),
    { loadFiles } = require('../../system/fileLoader'),
    os = require('os'),
    DB = require('../../schemas/Status'),
    emb = require('../../config/embed.json'),
    emoji = require('../../config/emojis.json');

// Variable checks (Use .env if present)
require('dotenv').config();
let UpdateInt;
if (process.env.updateInterval) {
    UpdateInt = process.env.updateInterval;
} else {
    const { updateInterval } = require('../../config/database.json');
    UpdateInt = updateInterval;
}

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("status")
            .setDescription("Bot Status Information")
            .setDefaultMemberPermissions()
            .setDMPermission(true),
        help: "/status [message]",
        cooldown: 10,
        allowedUIDs: [],

        run: async (client, interaction) => {
            // Find matching database data
            const docs = await DB.findOne({
                _id: client.user.id
            });

            await client.user.fetch();
            await client.application.fetch();

            // Check the total number of commands
            let check = [];
            const Files = await loadFiles("commands");
            Files.forEach((file) => { check.push(file) });

            // Create status and formatter handlers
            const
                formatter = new Intl.ListFormat("en-GB", { style: "long", type: "conjunction" }),
                getChannelTypeSize = type => client.channels.cache.filter(channel => type.includes(channel.type)).size,
                status = [
                    "Disconnected",
                    "Connected",
                    "Connecting",
                    "Disconnecting"
                ];

            // Compute for average memory usage
            let avgMem = (docs.memory.reduce((a, b) => +a + +b, 0) / docs.memory.length).toFixed(2);

            let response = new EmbedBuilder()
                .setColor(emb.color)
                .setTitle(`${client.user.username}'s Status`)
                .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
                .addFields(
                    { name: "📝 Description", value: `${client.application.description || "None"}` },
                    {
                        name: "General",
                        value: [
                            `⚙️ **Client** ${client.user.tag}`,
                            `💳 **ID** ${client.user.id}`,
                            `📆 **Created** <t:${parseInt(client.user.createdTimestamp / 1000)}:R>`,
                            `${emoji.owner} **Owner** ${client.application.owner ? `<@${client.application.owner.id}> (${client.application.owner.tag})` : "None"}`,
                            `${emoji.verified} **Verified** ${client.user.flags & UserFlags.VerifiedBot ? "Yes" : "No"}`,
                            `🏷 **Tags** ${client.application.tags.length ? formatter.format(client.application.tags.map(tag => `*${tag}*`)) : "None"}`,
                            `${emoji.slashCommand} **Commands** ${client.commands.size} / ${check.length}`
                        ].join("\n")
                    },
                    {
                        name: "System",
                        value: [
                            `🖥 **Operating System** ${os.type().replace("Windows_NT", "Windows").replace("Darwin", "macOS")}`,
                            `⏰ **Up Since** <t:${parseInt(client.readyTimestamp / 1000)}:R>`,
                            `🏓 **Ping** ${client.ws.ping}ms`,
                            `🧠 **CPU Model** ${os.cpus()[0].model}`,
                            `💾 **CPU Usage** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}%`,
                            `🐏 **Average RAM Usage** ${avgMem}MB`,
                            `📚 **Database** ${status[connection.readyState]}`,
                            `${emoji.nodejs} **Node.js** ${process.version}`,
                            `${emoji.djs} **Discord.js** ${version}`
                        ].join("\n"),
                        inline: true
                    },
                    {
                        // Using the caches for some of these isn't always reliable, but it would be a waste of resources to loop through all servers every single time someone used this command.
                        name: "Statistics",
                        value: [
                            `🌍 **Servers** ${client.guilds.cache.size}`,
                            `🧑🏻‍👩🏻‍👧🏻‍👦🏻 **Users** ${client.users.cache.filter(user => !user.bot).size}`,
                            `🤖 **Bots** ${client.users.cache.filter(user => user.bot).size}`,
                            `😄 **Emojis** ${client.emojis.cache.size}`,
                            `💬 **Text Channels** ${getChannelTypeSize([ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildAnnouncement])}`,
                            `🎙 **Voice Channels** ${getChannelTypeSize([ChannelType.GuildVoice, ChannelType.GuildStageVoice])}`,
                            `🧵 **Threads** ${getChannelTypeSize([ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread])}`
                        ].join("\n"),
                        inline: true
                    }
                )

            await interaction.reply({
                embeds: [response],
            });

            (async () => {
                // Graph colors
                const colors = {
                    purple: {
                        default: "rgba(149, 76, 233, 1)",
                        half: "rgba(149, 76, 233, 0.5)",
                        quarter: "rgba(149, 76, 233, 0.25)",
                        low: "rgba(149, 76, 233, 0.1)",
                        zero: "rgba(149, 76, 233, 0)"
                    },
                    indigo: {
                        default: "rgba(80, 102, 120, 1)",
                        quarter: "rgba(80, 102, 120, 0.25)"
                    },
                    green: {
                        default: "rgba(92, 221, 139, 1)",
                        half: "rgba(92, 221, 139, 0.5)",
                        quarter: "rgba(92, 221, 139, 0.25)",
                        low: "rgba(92, 221, 139, 0.1)",
                        zero: "rgba(92, 221, 139, 0)"
                    },
                };

                // Create labels based on Memory array length
                const labels = [];
                for (let i = UpdateInt; (i - UpdateInt) < (docs.memory.length * UpdateInt); i += UpdateInt) {
                    labels.push(i.toString());
                }

                // Chart Generation
                const width = 1500;
                const height = 720;

                const plugin = {
                    id: 'mainBg',
                    beforeDraw: (chart) => {
                        const ctx = chart.canvas.getContext('2d');
                        ctx.save();
                        ctx.globalCompositeOperation = 'destination-over';
                        ctx.fillStyle = '#192027';
                        ctx.fillRect(0, 0, chart.width, chart.height);
                        ctx.restore();
                    }
                }

                // Canvas Generation
                const chartCallback = (ChartJS) => { };
                const canvas = new ChartJSNodeCanvas({
                    width: width,
                    height: height,
                    plugins: {
                        modern: [require('chartjs-plugin-gradient')],
                    },
                    chartCallback: chartCallback
                });

                // Chart Data
                const chartData = {
                    labels: labels.reverse(),
                    datasets: [
                        {
                            label: 'RAM Usage',
                            fill: true,
                            backgroundColor: colors.green.low,
                            gradient: {
                                backgroundColor: {
                                    axis: 'y',
                                    colors: {
                                        0: colors.green.quarter,
                                        50: colors.green.low,
                                        100: colors.green.zero
                                    },
                                },
                            },
                            pointBackgroundColor: colors.green.default,
                            borderColor: colors.green.default,
                            data: docs.memory,
                            lineTension: 0.4,
                            borderWidth: 2,
                            pointRadius: 3
                        },
                    ],
                };

                // Output
                const chartConfig = {
                    type: "line",
                    data: chartData,
                    options: {
                        layout: {
                            padding: 10
                        },
                        responsive: false,
                        plugins: {
                            legend: {
                                display: true,
                            }
                        },
                        scales: {
                            xAxes: {
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    padding: 10,
                                    autoSkip: false,
                                    maxRotation: 0,
                                    minRotation: 0
                                }
                            },
                            yAxes: {
                                scaleLabel: {
                                    display: true,
                                    labelString: "Usage",
                                    padding: 10
                                },
                                gridLines: {
                                    display: true,
                                    color: colors.indigo.quarter
                                },
                                ticks: {
                                    beginAtZero: false,
                                    max: 63,
                                    min: 57,
                                    padding: 10
                                }
                            }
                        }
                    },
                    plugins: [plugin]
                };

                // Attach generated canvas
                const image = await canvas.renderToBuffer(chartConfig);
                const attachment = new AttachmentBuilder(image, { name: 'chart.png' });

                // Add hardware field to embed
                interaction.editReply({
                    embeds: [response.setImage('attachment://chart.png')],
                    files: [attachment],
                });
            })
        }
    }
} catch (e) { toError(e) }