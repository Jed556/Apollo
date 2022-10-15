const
    { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } = require('discord.js'),
    { toError } = require('../../system/functions'),
    { ChartJSNodeCanvas } = require('chartjs-node-canvas'),
    { connection } = require('mongoose'),
    osUtils = require('os-utils'),
    moment = require('moment'),
    DB = require('../../schemas/Status'),
    emb = require('../../config/embed.json');
require('moment-duration-format');

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

            // Create response embed
            let response = new EmbedBuilder()
                .setTitle("Client Status")
                .setColor(emb.color)
                .setFields([{
                    name: `<:icon_reply:962547429914337300> GENERAL`,
                    value: `
            **• Client**: <:icon_online:970322600930721802> ONLINE
            **• Ping**: ${client.ws.ping}ms
            **• Uptime**: ${moment.duration(parseInt(client.uptime)).format(" D [days], H [hrs], m [mins], s [secs]")}
            \n`,
                    inline: false
                }, {
                    name: `<:icon_reply:962547429914337300> DATABASE`,
                    value: `**• Connection**: ${switchTo(connection.readyState)}\n`,
                    inline: true
                }])

            await interaction.reply({
                embeds: [response],
            });

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

            // Compute for average memory usage
            var avgMem = 0;
            for (let i = 0; i < docs.memory.length; i++) {
                avgMem += docs.memory[i];
            }
            avgMem = avgMem / docs.memory.length;


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
                embeds: [response
                    .addFields({
                        name: `<:icon_reply:962547429914337300> HARDWARE`,
                        value: `
                        **• CPU Usage**: ${await cpuUsage()}
                        **• Average RAM Usage**: ${avgMem.toFixed(2)}MB
                        `,
                        inline: false
                    })
                    .setImage('attachment://chart.png')],
                files: [attachment],
            });
        }
    }
} catch (e) { toError(e) }

/**
 * 
 * @param {*} val Icon status value
 * @returns Icon status
 */
function switchTo(val) {
    var status = " ";
    switch (val) {
        case 0:
            status = `<:icon_offline:970322600771354634> DISCONNECTED`;
            break;

        case 1:
            status = `<:icon_online:970322600930721802> CONNECTED`;
            break;

        case 2:
            status = `<:icon_connecting:970322601887023125> CONNECTING`;
            break;

        case 3:
            status = `<:icon_disconnecting:970322601878638712> DISCONNECTING`;
            break;
    }
    return status;
}

/**
 * 
 * @param {*} toFixed Fixed decimal value
 * @returns CPU usage in percent
 */
function cpuUsage(toFixed) {
    let usage;

    osUtils.cpuUsage(v => {
        usage = (v * 100).toFixed(toFixed || 2);
    })

    //usage *= (100).toFixed(toFixed || 2);
    console.log(usage)
    return usage;
}