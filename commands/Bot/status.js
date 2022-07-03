const { MessageEmbed, MessageAttachment } = require('discord.js')
const emb = require('../../config/embed.json');
const { connection } = require('mongoose');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const DB = require('../../Structures/Schemas/Client');
const moment = require('moment');

require('../../events/client/ready');
require('moment-duration-format');

// Variable checks (Use .env if present)
require('dotenv').config();
let MemoryUpdate;
if (process.env.memoryUpdate) {
    MemoryUpdate = process.env.memoryUpdate;
} else {
    const { memoryUpdate } = require('../../config/database.json');
    MemoryUpdate = memoryUpdate;
}

// Optional, disabled by Default
function getPBar(percent) {
    let thick = Math.floor(percent / 5);
    let thin = Math.ceil((100 - percent) / 10) * 2;
    let str = " [";

    for (let i = 0; i < thick; i++) str += "▰";
    for (let i = 0; i < thin; i++) str += "▱";

    str += "] ";
    return str;
}

module.exports = {
    name: "status",
    description: "Bot Status Information",
    help: "/status",
    cooldown: 1,
    permissions: [],
    allowedUIDs: [],
    options: [],

    run: async (client, interaction) => {

        // Find matching database data
        const docs = await DB.findOne({
            Client: true
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
        for (let i = MemoryUpdate; i < docs.Memory.length + MemoryUpdate; i += MemoryUpdate) {
            labels.push(i.toString());
        }

        // Compute for average memory usage
        var avgMem = 0;
        for (let i = 0; i < docs.Memory.length; i++) {
            avgMem += docs.Memory[i];
        }
        avgMem = avgMem / docs.Memory.length;


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
        const chartCallback = (ChartJS) => { }
        const canvas = new ChartJSNodeCanvas({
            width: width,
            height: height,
            plugins: {
                modern: [require('chartjs-plugin-gradient')],
            },
            chartCallback: chartCallback
        })

        // Chart Data
        const chartData = {
            labels: labels.reverse(),
            datasets: [
                {
                    label: 'RAM Usage',
                    fill: true,
                    backgroundColor: colors.green.low,
                    // gradient: {
                    //     backgroundColor: {
                    //         axis: 'y',
                    //         colors: {
                    //             0: colors.green.quarter,
                    //             50: colors.green.low,
                    //             100: colors.green.zero
                    //         },
                    //     },
                    // },
                    pointBackgroundColor: colors.green.default,
                    borderColor: colors.green.default,
                    data: docs.Memory,
                    lineTension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3
                },
            ],
        }

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
        }

        const image = await canvas.renderToBuffer(chartConfig);
        const attachment = new MessageAttachment(image, 'chart.png');

        const response = new MessageEmbed()
            .setTitle("Client Status")
            .setColor(emb.color)
            .addFields({
                name: `<:icon_reply:962547429914337300> GENERAL`,
                value:
                    `
                **• Client**: <:icon_online:970322600930721802> ONLINE
                **• Ping**: ${client.ws.ping}ms
                **• Uptime**: ${moment.duration(parseInt(client.uptime)).format(" D [days], H [hrs], m [mins], s [secs]")}
                \n
                `,
                inline: false
            }, {
                name: `<:icon_reply:962547429914337300> DATABASE`,
                value:
                    `
                **• Connection**: ${switchTo(connection.readyState)}
                \n
                `,
                inline: true
            }, {
                name: `<:icon_reply:962547429914337300> HARDWARE`,
                value:
                    `
                **• Average RAM Usage**: ${avgMem.toFixed(2)}MB
                `,
                inline: false,
            })
            .setImage('attachment://chart.png')

        interaction.reply({
            embeds: [response],
            files: [attachment],
        });
    }
}

function switchTo(val) {
    var status = " ";
    switch (val) {
        case 0:
            status = `<:icon_offline:970322600771354634> DISCONNECTED`
            break;

        case 1:
            status = `<:icon_online:970322600930721802> CONNECTED`
            break;

        case 2:
            status = `<:icon_connecting:970322601887023125> CONNECTING`
            break;

        case 3:
            status = `<:icon_disconnecting:970322601878638712> DISCONNECTING`
            break;
    }
    return status;
}