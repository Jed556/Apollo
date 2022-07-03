const { MessageButton, MessageActionRow, MessageEmbed, Permissions, MessageSelectMenu } = require('discord.js');
const { delay, escapeRegex } = require('../system/functions');
const { check_if_dj } = require('../system/distubeFunctions');
const emb = require('../config/embed.json');
const emoji = require('../config/emojis.json');
const settings = require('../config/distube.json');
const DB = require('../Structures/Schemas/Distube');
const playerintervals = new Map();
const PlayerMap = new Map();
let songEditInterval = null;
let endCheck = false;

// Variable checks (Use .env if present)
require('dotenv').config();
let Database
if (process.env.database) {
    Database = process.env.database;
} else {
    const { database } = require('../config/database.json');
    Database = database;
}

module.exports = (client) => {
    try {

        // ---------------------  AUTORESUNE AND DATABASING IS NOT AVAILABLE YET  --------------------- //

        // // Connect to database
        // if (connectDB) {
        //     if (!Database) return;
        //     mongoose.connect(Database, {
        //         dbName: "Distube",
        //         useNewUrlParser: true,
        //         useUnifiedTopology: true
        //     }).catch((err) => {
        //         console.log(`${red.bold("[ERROR]")} Distube is not connected to database \n${err}\n`);
        //     });
        // }

        // /* ---------- DATABASE HANDLING ---------- */
        // distubeSettings = []
        // if (connectDB) {
        //     //Used Memory in GB
        //     distubeSettings.push(await "");

        //     // Update database
        //     await DB.findOneAndUpdate(
        //         { Guild: "" },
        //         { defaultvolume: 100 },
        //         { defaultautoplay: false },
        //         { defaultfilters: ["bassboost6", "clear"] },
        //         { djroles: [] },
        //         { upsert: true, }
        //     );
        // }

        // AUTO-RESUME-FUNCTION
        const autoconnect = async () => {
            let guilds = client.autoresume.keyArray();
            console.log(`AUTORESUME` + ` - Guilds to Autoresume:`, guilds)
            if (!guilds || guilds.length == 0) return;
            for (const gId of guilds) {
                try {
                    let guild = client.guilds.cache.get(gId);
                    if (!guild) {
                        client.autoresume.delete(gId);
                        console.log(`AUTORESUME` + ` - Bot was kicked from the Guild`)
                        continue;
                    }
                    let data = client.autoresume.get(gId);

                    let voiceChannel = guild.channels.cache.get(data.voiceChannel);
                    if (!voiceChannel && data.voiceChannel) voiceChannel = await guild.channels.fetch(data.voiceChannel).catch(() => { }) || false;
                    if (!voiceChannel || !voiceChannel.members || voiceChannel.members.filter(m => !m.user.bot && !m.voice.deaf && !m.voice.selfDeaf).size < 1) {
                        client.autoresume.delete(gId);
                        console.log(`AUTORESUME` + ` - Voice Channel is either Empty / No Listeners / Deleted`)
                        continue;
                    }

                    let textChannel = guild.channels.cache.get(data.textChannel);
                    if (!textChannel) textChannel = await guild.channels.fetch(data.textChannel).catch(() => { }) || false;
                    if (!textChannel) {
                        client.autoresume.delete(gId);
                        console.log(`AUTORESUME` + ` - Text Channel got deleted`)
                        continue;
                    }
                    let tracks = data.songs;
                    if (!tracks || !tracks[0]) {
                        console.log(`AUTORESUME` + ` - Destroyed the player, there are no tracks available`);
                        continue;
                    }
                    const makeTrack = async track => {
                        return new DisTube.Song(
                            new DisTube.SearchResult({
                                duration: track.duration,
                                formattedDuration: track.formattedDuration,
                                id: track.id,
                                isLive: track.isLive,
                                name: track.name,
                                thumbnail: track.thumbnail,
                                type: "video",
                                uploader: track.uploader,
                                url: track.url,
                                views: track.views,
                            }), guild.members.cache.get(track.memberId) || guild.me, track.source);
                    };
                    await client.distube.play(voiceChannel, tracks[0].url, {
                        member: guild.members.cache.get(tracks[0].memberId) || guild.me,
                        textChannel: textChannel
                    })
                    let newQueue = client.distube.getQueue(guild.id);
                    //tracks = tracks.map(track => makeTrack(track));
                    //newQueue.songs = [newQueue.songs[0], ...tracks.slice(1)]
                    for (const track of tracks.slice(1)) {
                        newQueue.songs.push(await makeTrack(track))
                    }
                    console.log(`AUTORESUME` + ` - Added ${newQueue.songs.length} Tracks on the QUEUE and started playing ${newQueue.songs[0].name} in ${guild.name}`);
                    // ADJUST THE QUEUE SETTINGS
                    await newQueue.setVolume(data.volume)
                    if (data.repeatMode && data.repeatMode !== 0) {
                        newQueue.setRepeatMode(data.repeatMode);
                    }
                    if (!data.playing) {
                        newQueue.pause();
                    }
                    await newQueue.seek(data.currentTime);
                    if (data.filters && data.filters.length > 0) {
                        await newQueue.setFilter(data.filters, true);
                    }
                    client.autoresume.delete(newQueue.id)
                    console.log(`AUTORESUME` + " - Changed autoresume track to queue adjustments & deleted the database entry")
                    if (!data.playing) {
                        newQueue.pause();
                    }
                    await delay(settings["auto-resume-delay"] || 1000)
                } catch (e) {
                    console.log(e);
                }
            }
        }
        client.on("ready", () => {
            setTimeout(() => autoconnect(), 2 * client.ws.ping);
        })

        client.distube
            .on(`playSong`, async (queue, track) => {
                try {
                    if (!client.guilds.cache.get(queue.id).me.voice.deaf)
                        client.guilds.cache.get(queue.id).me.voice.setDeaf(true).catch((e) => {
                            //console.log(e.stack ? String(e.stack) : String(e))
                        });
                } catch (error) {
                    console.log(error);
                }
                try {
                    var newQueue = client.distube.getQueue(queue.id);
                    var oldLoop = newQueue.repeatMode;
                    updateMusicSystem(newQueue);
                    var data = receiveQueueData(newQueue, track);
                    if (queue.textChannel.id === client.distubeSettings.get(queue.id, `music.channel`)) return;

                    // Send message with buttons
                    let currentSongPlayMsg = await queue.textChannel.send(data).then(msg => {
                        PlayerMap.set(`currentmsg`, msg.id);
                        return msg;
                    })

                    // Create a collector for the current song playing
                    var collector = currentSongPlayMsg.createMessageComponentCollector({
                        filter: (i) => i.isButton() && i.user && i.message.author.id == client.user.id,
                        time: track.duration > 0 ? track.duration * 1000 : 600000
                    }); //collector for 5 seconds

                    // Array of last 10 embeds (0-9)
                    let lastEdited = false;

                    // EDIT THE SONG DASHBOARD EVERY 10 SECONDS!
                    try { clearInterval(songEditInterval) } catch (e) { }
                    songEditInterval = setInterval(async () => {
                        if (!lastEdited) {
                            try {
                                var newQueue = client.distube.getQueue(queue.id);
                                var data = receiveQueueData(newQueue, newQueue.songs[0]);
                                await currentSongPlayMsg.edit(data).catch((e) => {
                                    // console.log(e.stack ? String(e.stack) : String(e))
                                });
                            } catch (e) {
                                clearInterval(songEditInterval)
                            }
                        }
                    }, 10000);

                    collector.on('collect', async i => {
                        // Get the channel instances from i (interaction)
                        let { member } = i;
                        const { channel } = member.voice;

                        // ---------------------------------------- GLOBAL EMBEDS ---------------------------------------- //

                        let joinAlert;
                        if (!channel) {
                            joinAlert = new MessageEmbed()
                                .setTimestamp()
                                .setColor(emb.errColor)
                                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                                .setAuthor({ name: "JOIN A VOICE CHANNEL FIRST", iconURL: emb.disc.alert })
                        } else if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
                            joinAlert = new MessageEmbed()
                                .setTimestamp()
                                .setColor(emb.errColor)
                                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                                .setAuthor({ name: "JOIN MY VOICE CHANNEL FIRST", iconURL: emb.disc.alert })
                                .setDescription(`**Channel: <#${channel.guild.me.voice.channel.id}>**`)
                        }

                        const djAlert = new MessageEmbed()
                            .setTimestamp()
                            .setColor(emb.errColor)
                            .setAuthor({ name: "YOU ARE NOT A DJ OR THE SONG REQUESTER", iconURL: emb.disc.alert })
                            .setDescription(`**DJ-ROLES:**\n${check_if_dj(client, member, client.distube.getQueue(i.guild.id).songs[0])}`)

                        const noPLayerAlert = new MessageEmbed()
                            .setTimestamp()
                            .setColor(emb.errColor)
                            .setAuthor({ name: "NOTHING PLAYING YET", iconURL: emb.disc.alert })
                            .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })

                        const errorEmb = new MessageEmbed()
                            .setTimestamp()
                            .setColor(emb.errColor)
                            .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })

                        const successEmb = new MessageEmbed()
                            .setTimestamp()
                            .setColor(emb.color)
                            .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })

                        if (i.customId != `10` && check_if_dj(client, i.member, client.distube.getQueue(i.guild.id).songs[0])) {
                            return i.reply({
                                embeds: [djAlert],
                                ephemeral: true
                            }).then(interaction => {
                                if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                    setTimeout(() => {
                                        try {
                                            interaction.deleteReply().catch(console.log);
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }, 3000)
                                }
                            })
                        }
                        lastEdited = true;
                        setTimeout(() => {
                            lastEdited = false
                        }, 7000)

                        // ---------------------------------------- PREVIOUS ---------------------------------------- //
                        if (i.customId == `1`) {
                            // If there are no previous songs then return error
                            if (!newQueue.previousSongs || newQueue.previousSongs.length == 0) {
                                return i.reply({
                                    embeds: [errorEmb
                                        .setAuthor({ name: "NO PREVIOUS SONG", iconURL: emb.disc.alert })
                                    ],
                                    ephemeral: true
                                })
                            }
                            await newQueue.previous();
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: "PLAYING PREVIOUS SONG", iconURL: emb.disc.previous })
                                ]
                            }).then(interaction => {
                                if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                    setTimeout(() => {
                                        try {
                                            interaction.deleteReply().catch(console.log);
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }, 3000)
                                }
                            })
                            // Get the player instance
                            const queue = client.distube.getQueue(i.guild.id);

                            // If no player available return aka not playing anything
                            if (!queue || !newQueue.songs || newQueue.songs.length == 0) {
                                return i.reply({
                                    embeds: [noPLayerAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                            }

                            // If the member is not in a channel or in the same channel, return
                            if (!channel || channel.id !== newQueue.voiceChannel.id)
                                return i.reply({
                                    embeds: [joinAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                        }

                        // ---------------------------------------- SKIP ---------------------------------------- //
                        if (i.customId == `2`) {
                            // Get the player instance
                            const queue = client.distube.getQueue(i.guild.id);
                            // If no player available return aka not playing anything
                            if (!queue || !newQueue.songs || newQueue.songs.length == 0) {
                                return i.reply({
                                    embeds: [noPLayerAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                            }

                            // If the member is not in a channel or in the same channel, return
                            if (!channel || channel.id !== newQueue.voiceChannel.id)
                                return i.reply({
                                    embeds: [joinAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })

                            // If there is nothing more to skip then stop music and leave the Channel
                            if (newQueue.songs.length == 0) {
                                // If its on autoplay mode, then do autoplay before leaving...
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "NO MORE SONGS IN QUEUE", iconURL: emb.disc.skip })
                                        .setDescription(`**STOPPED THE PLAYER & LEFT THE VOICE CHANNEL**`)
                                    ]
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                                clearInterval(songEditInterval);
                                // Edit the current song message
                                await client.distube.stop(i.guild.id)
                                return
                            }
                            // Skip the track
                            await client.distube.skip(i.guild.id)
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: "SKIPPED TO NEXT SONG", iconURL: emb.disc.skip })
                                ]
                            }).then(interaction => {
                                if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                    setTimeout(() => {
                                        try {
                                            i.deleteReply().catch(console.log);
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }, 3000)
                                }
                            })
                        }

                        // ---------------------------------------- STOP ---------------------------------------- //
                        if (i.customId == `3`) {
                            // If the member is not in a channel or in the same channel, return
                            if (!channel || channel.id !== newQueue.voiceChannel.id)
                                return i.reply({
                                    embeds: [joinAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })

                            // Stop the track
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: "STOPPED PLAYING", iconURL: emb.disc.stop })
                                    .setDescription(`**STOPPED THE PLAYER & LEFT THE VOICE CHANNEL**`)
                                ]
                            }).then(interaction => {
                                if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                    setTimeout(() => {
                                        try {
                                            i.deleteReply().catch(console.log);
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }, 3000)
                                }
                            })
                            clearInterval(songEditInterval);
                            // Edit the current song message
                            stopCheck = true;
                            await client.distube.stop(i.guild.id)
                        }

                        // ---------------------------------------- PAUSE & RESUME ---------------------------------------- //
                        if (i.customId == `4`) {
                            // If the member is not in a channel or in the same channel, return
                            if (!channel || channel.id !== newQueue.voiceChannel.id)
                                return i.reply({
                                    embeds: [joinAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })

                            if (newQueue.playing) {
                                await client.distube.pause(i.guild.id);
                                var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                                currentSongPlayMsg.edit(data).catch((e) => {
                                    //console.log(e.stack ? String(e.stack): String(e))
                                })
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "PAUSED", iconURL: emb.disc.pause })
                                    ]
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                            } else {
                                // Pause the player
                                await client.distube.resume(i.guild.id);
                                var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                                currentSongPlayMsg.edit(data).catch((e) => {
                                    //console.log(e.stack ? String(e.stack): String(e))
                                })
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "RESUMED", iconURL: emb.disc.resume })
                                    ]
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                            }
                        }

                        // ---------------------------------------- SHUFFLE ---------------------------------------- //
                        if (i.customId == `5`) {
                            // If the member is not in a channel or in the same channel, return
                            if (!channel || channel.id !== newQueue.voiceChannel.id)
                                return i.reply({
                                    embeds: [joinAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })

                            client.maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
                            // Pause the player
                            await newQueue.shuffle()
                            //Send Success Message
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: `SHUFFELED  ${newQueue.songs.length} SONGS`, iconURL: emb.disc.shuffle })
                                ]
                            }).then(interaction => {
                                if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                    setTimeout(() => {
                                        try {
                                            interaction.deleteReply().catch(console.log);
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }, 3000)
                                }
                            })
                        }


                        // ---------------------------------------- AUTOPLAY ---------------------------------------- //
                        if (i.customId == `6`) {
                            // If the member is not in a channel or in the same channel, return
                            if (!channel || channel.id !== newQueue.voiceChannel.id)
                                return i.reply({
                                    embeds: [joinAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })

                            // Pause the player
                            await newQueue.toggleAutoplay()
                            if (newQueue.autoplay) {
                                var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                                currentSongPlayMsg.edit(data).catch((e) => {
                                    //console.log(e.stack ? String(e.stack): String(e))
                                })
                            } else {
                                var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                                currentSongPlayMsg.edit(data).catch((e) => {
                                    //console.log(e.stack ? String(e.stack): String(e))
                                })
                            }
                            // Send Success Message
                            if (newQueue.autoplay) {
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "ENABLED AUTOPLAY", iconURL: emb.disc.autoplay.on })
                                    ]
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                            } else {
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "DISABLED AUTOPLAY", iconURL: emb.disc.autoplay.off })
                                    ]
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                            }
                        }

                        // ---------------------------------------- SONG LOOP ---------------------------------------- //
                        if (i.customId == `7`) {
                            // If the member is not in a channel or in the same channel, return
                            if (!channel || channel.id !== newQueue.voiceChannel.id)
                                return i.reply({
                                    embeds: [joinAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })

                            // Disable the Repeatmode
                            if (newQueue.repeatMode == 1) {
                                await newQueue.setRepeatMode(0)
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "DISABLED SONG LOOP", iconURL: emb.disc.loop.none })
                                    ]
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                            }
                            // Enable loop
                            else {
                                await newQueue.setRepeatMode(1)
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: `${oldLoop == 0 ? "ENABLED SONG" : "DISABLED QUEUE LOOP & ENABLED SONG"} LOOP`, iconURL: emb.disc.loop.song })
                                    ]
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                            }

                            var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                            currentSongPlayMsg.edit(data).catch((e) => {
                                //console.log(e.stack ? String(e.stack): String(e))
                            })
                        }

                        // ---------------------------------------- QUEUE LOOP ---------------------------------------- //
                        if (i.customId == `8`) {
                            // If the member is not in a channel or in the same channel, return
                            if (!channel || channel.id !== newQueue.voiceChannel.id)
                                return i.reply({
                                    embeds: [joinAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })

                            //Disable the Repeatmode
                            if (newQueue.repeatMode == 2) {
                                await newQueue.setRepeatMode(0)
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "DISABLED QUEUE LOOP", iconURL: emb.disc.loop.none })
                                    ]
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                            }
                            //Enable it
                            else {
                                await newQueue.setRepeatMode(2)
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: `${oldLoop == 0 ? "ENABLED QUEUE" : "DISABLED SONG LOOP & ENABLED QUEUE"} LOOP`, iconURL: emb.disc.loop.queue })
                                    ]
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })
                            }

                            var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                            currentSongPlayMsg.edit(data).catch((e) => {
                                //console.log(e.stack ? String(e.stack): String(e))
                            })
                        }

                        // ---------------------------------------- REWIND ---------------------------------------- //
                        if (i.customId == `9`) {
                            // If the member is not in a channel or in the same channel, return
                            if (!channel || channel.id !== newQueue.voiceChannel.id)
                                return i.reply({
                                    embeds: [joinAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })

                            let seektime = newQueue.currentTime - 10;
                            if (seektime < 0) seektime = 0;
                            if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
                            await newQueue.seek(Number(seektime))
                            collector.resetTimer({ time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000 })
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: "REWINDED FOR 10 SECONDS", iconURL: emb.disc.rewind })
                                ]
                            }).then(interaction => {
                                if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                    setTimeout(() => {
                                        try {
                                            interaction.deleteReply().catch(console.log);
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }, 3000)
                                }
                            })

                            var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                            currentSongPlayMsg.edit(data).catch((e) => {
                                //console.log(e.stack ? String(e.stack): String(e))
                            })
                        }

                        // ---------------------------------------- FORWARD ---------------------------------------- //
                        if (i.customId == `10`) {
                            // If the member is not in a channel or in the same channel, return
                            if (!channel || channel.id !== newQueue.voiceChannel.id)
                                return i.reply({
                                    embeds: [joinAlert],
                                    ephemeral: true
                                }).then(interaction => {
                                    if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                        setTimeout(() => {
                                            try {
                                                interaction.deleteReply().catch(console.log);
                                            } catch (e) {
                                                console.log(e)
                                            }
                                        }, 3000)
                                    }
                                })

                            let seektime = newQueue.currentTime + 10;
                            if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
                            await newQueue.seek(Number(seektime))
                            collector.resetTimer({ time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000 })
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: "FORWARDED FOR 10 SECONDS", iconURL: emb.disc.forward })
                                ]
                            }).then(interaction => {
                                if (newQueue.textChannel.id === client.distubeSettings.get(newQueue.id, `music.channel`)) {
                                    setTimeout(() => {
                                        try {
                                            interaction.deleteReply().catch(console.log);
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }, 3000)
                                }
                            })

                            var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                            currentSongPlayMsg.edit(data).catch((e) => {
                                //console.log(e.stack ? String(e.stack) : String(e))
                            })
                        }
                    });
                } catch (error) {
                    console.error(error)
                }
            })

            // If a song was added to the queue
            .on(`addSong`, (queue, song) => {
                updateMusicSystem(queue);
                queue.textChannel.send({
                    embeds: [new MessageEmbed()
                        .setTimestamp()
                        .setColor(emb.color)
                        .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
                        .setFooter({ text: song.user.tag, iconURL: song.user.displayAvatarURL({ dynamic: true }) })
                        .setAuthor({ name: "SONG ADDED TO QUEUE", iconURL: emb.disc.song.add })
                        .setDescription(`Song: [\`${song.name}\`](${song.url})  -  \`${song.formattedDuration}\``)
                        .addField(`⌛ **Estimated Time:**`, `\`${queue.songs.length - 1} song${queue.songs.length != 1 ? "s" : ""}\` - \`${(Math.floor((queue.duration - song.duration) / 60 * 100) / 100).toString().replace(".", ":")}\``)
                        .addField(`🌀 **Queue Duration:**`, `\`${queue.formattedDuration}\``)
                    ]
                }).then(msg => {
                    if (queue.textChannel.id === client.distubeSettings.get(queue.id, `music.channel`)) {
                        setTimeout(() => {
                            try {
                                if (!msg.deleted) {
                                    msg.delete().catch(() => { });
                                }
                            } catch (e) {

                            }
                        })
                    }
                }, 3000)
            })

            // If a song was added to a list
            .on(`addList`, (queue, playlist) => {
                updateMusicSystem(queue);
                queue.textChannel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTimestamp()
                            .setColor(emb.color)
                            .setThumbnail(playlist.thumbnail.url ? playlist.thumbnail.url : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`)
                            .setFooter({ text: playlist.user.tag, iconURL: playlist.user.displayAvatarURL({ dynamic: true }) })
                            .setAuthor({ name: "PLAYLIST ADDED TO QUEUE", iconURL: emb.disc.song.add })
                            .setDescription(`Playlist: [\`${playlist.name}\`](${playlist.url ? playlist.url : ""})  -  \`${playlist.songs.length} Song${playlist.songs.length != 0 ? "s" : ""}\``)
                            .addField(`⌛ **Estimated Time:**`, `\`${queue.songs.length - - playlist.songs.length} song${queue.songs.length != 1 ? "s" : ""}\` - \`${(Math.floor((queue.duration - playlist.duration) / 60 * 100) / 100).toString().replace(".", ":")}\``)
                            .addField(`🌀 **Queue Duration:**`, `\`${queue.formattedDuration}\``)
                    ]
                }).then(msg => {
                    if (queue.textChannel.id === client.distubeSettings.get(queue.id, `music.channel`)) {
                        setTimeout(() => {
                            try {
                                if (!msg.deleted) {
                                    msg.delete().catch(() => { });
                                }
                            } catch (e) {

                            }
                        }, 3000)
                    }
                })
            })

            // DisTubeOptions.searchSongs = true
            .on(`searchResult`, (message, result) => {
                let i = 0
                message.channel.send(`**Choose an option from below**\n${result.map((song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join(`\n`)}\n*Enter anything else or wait 60 seconds to cancel*`)
            })

            // DisTubeOptions.searchSongs = true
            .on(`searchCancel`, message => message.channel.send(`Searching canceled`).catch((e) => console.log(e)))

            // If an error occured
            .on(`error`, (channel, e) => {
                channel.send({
                    embeds: [new MessageEmbed()
                        .setTimestamp()
                        .setColor(emb.errColor)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setAuthor({ name: "AN ERROR OCCURED", iconURL: emb.disc.error })
                        .setDescription(`\`/info support\` for support or DM me \`${client.user.tag}\` \`\`\`${e}\`\`\``)]
                }).catch((e) => console.log(e))
                console.error(e)
            })

            // Leave if the voice channel is empty
            .on(`empty`, queue => {
                endCheck = true;
                var embed = new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setAuthor({ name: "VOICE CHANNEL EMPTY", iconURL: emb.disc.alert })
                    .setDescription("**LEFT THE CHANNEL**")
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                queue.textChannel.send({ embeds: [embed], components: [] }).catch((e) => {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
            })

            // If no results are found
            .on(`searchNoResult`, message => message.channel.send(`No result found!`).catch((e) => console.log(e)))

            // If a song is done playing
            .on(`finishSong`, (queue, song) => {
                var embed = new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setAuthor({ name: "DASHBOARD | SONG ENDED", iconURL: emb.disc.done })
                    .setDescription(`**[${song.name}](${song.url})**`)
                    .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
                    .setFooter({ text: song.user.tag, iconURL: song.user.displayAvatarURL({ dynamic: true }) })

                queue.textChannel.messages.fetch(PlayerMap.get(`currentmsg`)).then(currentSongPlayMsg => {
                    currentSongPlayMsg.edit({ embeds: [embed], components: [] }).catch((e) => {
                        //console.log(e.stack ? String(e.stack) : String(e))
                    })
                }).catch((e) => {
                    //console.log(e.stack ? String(e.stack) : String(e))
                })
            })

            // If queue is deleted
            .on(`deleteQueue`, queue => {
                if (!PlayerMap.has(`deleted-${queue.id}`)) {
                    PlayerMap.set(`deleted-${queue.id}`, true);
                    if (client.maps.has(`beforeshuffle-${queue.id}`)) {
                        client.maps.delete(`beforeshuffle-${queue.id}`);
                    }
                    try {
                        //Delete the interval for the check relevant messages system so
                        clearInterval(playerintervals.get(`checkrelevantinterval-${queue.id}`))
                        playerintervals.delete(`checkrelevantinterval-${queue.id}`);

                        // Delete the Interval for the autoresume saver
                        clearInterval(playerintervals.get(`autoresumeinterval-${queue.id}`))
                        if (client.autoresume.has(queue.id)) client.autoresume.delete(queue.id); //Delete the db if it's still in there
                        playerintervals.delete(`autoresumeinterval-${queue.id}`);

                        // Delete the interval for the Music Edit Embeds System
                        clearInterval(playerintervals.get(`musicsystemeditinterval-${queue.id}`))
                        playerintervals.delete(`musicsystemeditinterval-${queue.id}`);
                    } catch (e) {
                        console.log(e)
                    }
                    updateMusicSystem(queue, true);
                    if (endCheck) {
                        queue.textChannel.send({
                            embeds: [new MessageEmbed()
                                .setTimestamp()
                                .setColor(emb.color)
                                .setAuthor({ name: "LEFT THE CHANNEL", iconURL: emb.disc.alert })
                                .setDescription(`**NO MORE SONGS LEFT**`)
                                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                            ]
                        }).then(msg => {
                            if (queue.textChannel.id === client.distubeSettings.get(queue.id, `music.channel`)) {
                                setTimeout(() => {
                                    try {
                                        if (!msg.deleted) {
                                            msg.delete().catch(() => { });
                                        }
                                    } catch (e) {

                                    }
                                })
                            }
                        }, 3000)
                        endCheck = false;
                    }
                }
            })

            .on(`initQueue`, queue => {
                try {
                    if (PlayerMap.has(`deleted-${queue.id}`)) {
                        PlayerMap.delete(`deleted-${queue.id}`)
                    }
                    let data = client.distubeSettings.get(queue.id)
                    queue.autoplay = Boolean(data.defaultautoplay);
                    queue.volume = Number(data.defaultvolume);
                    queue.setFilter(data.defaultfilters);

                    // Check-Relevant-Messages inside of the Music System Request Channel
                    var checkrelevantinterval = setInterval(async () => {
                        if (client.distubeSettings.get(queue.id, `music.channel`) && client.distubeSettings.get(queue.id, `music.channel`).length > 5) {
                            console.log(`Music System - Relevant Checker`.brightCyan + ` - Checkingfor unrelevant Messages`)
                            let messageId = client.distubeSettings.get(queue.id, `music.message`);

                            // Try to get the guild
                            let guild = client.guilds.cache.get(queue.id);
                            if (!guild) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Guild not found!`)

                            // Try to get the channel
                            let channel = guild.channels.cache.get(client.distubeSettings.get(queue.id, `music.channel`));
                            if (!channel) channel = await guild.channels.fetch(client.distubeSettings.get(queue.id, `music.channel`)).catch(() => { }) || false
                            if (!channel) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Channel not found!`)
                            if (!channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.MANAGE_MESSAGES)) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Missing Permissions`)

                            // Try to get the channel
                            let messages = await channel.messages.fetch();
                            if (messages.filter(m => m.id != messageId).size > 0) {
                                channel.bulkDelete(messages.filter(m => m.id != messageId)).catch(() => { })
                                    .then(messages => console.log(`Music System - Relevant Checker`.brightCyan + ` - Bulk deleted ${messages.size} messages`))
                            } else {
                                console.log(`Music System - Relevant Checker`.brightCyan + ` - No Relevant Messages`)
                            }
                        }
                    }, settings["music-system-relevant-checker-delay"] || 60000);
                    playerintervals.set(`checkrelevantinterval-${queue.id}`, checkrelevantinterval);

                    /**
                     * AUTO-RESUME-DATABASING
                     */
                    var autoresumeinterval = setInterval(async () => {
                        var newQueue = client.distube.getQueue(queue.id);
                        if (newQueue && newQueue.id && client.distubeSettings.get(newQueue.id, `autoresume`)) {
                            const makeTrackData = track => {
                                return {
                                    memberId: track.member.id,
                                    source: track.source,
                                    duration: track.duration,
                                    formattedDuration: track.formattedDuration,
                                    id: track.id,
                                    isLive: track.isLive,
                                    name: track.name,
                                    thumbnail: track.thumbnail,
                                    type: "video",
                                    uploader: track.uploader,
                                    url: track.url,
                                    views: track.views,
                                }
                            }
                            client.autoresume.ensure(newQueue.id, {
                                guild: newQueue.id,
                                voiceChannel: newQueue.voiceChannel ? newQueue.voiceChannel.id : null,
                                textChannel: newQueue.textChannel ? newQueue.textChannel.id : null,
                                songs: newQueue.songs && newQueue.songs.length > 0 ? [...newQueue.songs].map(track => makeTrackData(track)) : null,
                                volume: newQueue.volume,
                                repeatMode: newQueue.repeatMode,
                                playing: newQueue.playing,
                                currentTime: newQueue.currentTime,
                                filters: [...newQueue.filters].filter(Boolean),
                                autoplay: newQueue.autoplay,
                            });
                            let data = client.autoresume.get(newQueue.id);
                            if (data.guild != newQueue.id) client.autoresume.set(newQueue.id, newQueue.id, `guild`)
                            if (data.voiceChannel != newQueue.voiceChannel ? newQueue.voiceChannel.id : null) client.autoresume.set(newQueue.id, newQueue.voiceChannel ? newQueue.voiceChannel.id : null, `voiceChannel`)
                            if (data.textChannel != newQueue.textChannel ? newQueue.textChannel.id : null) client.autoresume.set(newQueue.id, newQueue.textChannel ? newQueue.textChannel.id : null, `textChannel`)

                            if (data.volume != newQueue.volume) client.autoresume.set(newQueue.id, newQueue.volume, `volume`)
                            if (data.repeatMode != newQueue.repeatMode) client.autoresume.set(newQueue.id, newQueue.repeatMode, `repeatMode`)
                            if (data.playing != newQueue.playing) client.autoresume.set(newQueue.id, newQueue.playing, `playing`)
                            if (data.currentTime != newQueue.currentTime) client.autoresume.set(newQueue.id, newQueue.currentTime, `currentTime`)
                            if (!arraysEqual([...data.filters].filter(Boolean), [...newQueue.filters].filter(Boolean))) client.autoresume.set(newQueue.id, [...newQueue.filters].filter(Boolean), `filters`)
                            if (data.autoplay != newQueue.autoplay) client.autoresume.set(newQueue.id, newQueue.autoplay, `autoplay`)
                            if (newQueue.songs && !arraysEqual(data.songs, [...newQueue.songs])) client.autoresume.set(newQueue.id, [...newQueue.songs].map(track => makeTrackData(track)), `songs`)

                            function arraysEqual(a, b) {
                                if (a === b) return true;
                                if (a == null || b == null) return false;
                                if (a.length !== b.length) return false;

                                for (var i = 0; i < a.length; ++i) {
                                    if (a[i] !== b[i]) return false;
                                }
                                return true;
                            }
                        }
                    }, settings["auto-resume-save-cooldown"] || 5000);
                    playerintervals.set(`autoresumeinterval-${queue.id}`, autoresumeinterval);

                    /**
                     * Music System Edit Embeds
                     */

                    var musicsystemeditinterval = setInterval(async () => {
                        if (client.distubeSettings.get(queue.id, `music.channel`) && client.distubeSettings.get(queue.id, `music.channel`).length > 5) {
                            let messageId = client.distubeSettings.get(queue.id, `music.message`);

                            // Try to get the guild
                            let guild = client.guilds.cache.get(queue.id);
                            if (!guild) return console.log(`Music System Edit Embeds` + ` - Music System - Guild not found!`)

                            // Try to get the channel
                            let channel = guild.channels.cache.get(client.distubeSettings.get(queue.id, `music.channel`));
                            if (!channel) channel = await guild.channels.fetch(client.distubeSettings.get(queue.id, `music.channel`)).catch(() => { }) || false
                            if (!channel) return console.log(`Music System Edit Embeds` + ` - Music System - Channel not found!`)
                            if (!channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) return console.log(`Music System - Missing Permissions`)

                            // Try to get the channel
                            let message = channel.messages.cache.get(messageId);
                            if (!message) message = await channel.messages.fetch(messageId).catch(() => { }) || false;
                            if (!message) return console.log(`Music System Edit Embeds` + ` - Music System - Message not found!`)
                            if (!message.editedTimestamp) return console.log(`Music System Edit Embeds` + ` - Never Edited before!`)
                            if (Date.now() - message.editedTimestamp > (settings["music-request-edit-delay"] || 7000) - 100) {
                                var data = generateQueueEmbed(client, queue.id)
                                message.edit(data).catch((e) => {
                                    console.log(e)
                                }).then(m => {
                                    console.log(`Music System Edit Embeds` + ` - Edited the Music System Embed, because no other edit in the last ${Math.floor((settings["music-request-edit-delay"] || 7000) / 1000)} Seconds!`)
                                })
                            }
                        }
                    }, settings["music-request-edit-delay"] || 7000);
                    playerintervals.set(`musicsystemeditinterval-${queue.id}`, musicsystemeditinterval);
                } catch (error) {
                    console.error(error)
                }
            });
    } catch (e) {
        console.log(String(e.stack))
    }

    // DASHBOARD
    function receiveQueueData(newQueue, newTrack) {
        var djs = client.distubeSettings.get(newQueue.id, `djroles`);
        if (!djs || !Array.isArray(djs)) djs = [];
        else djs = djs.map(r => `<@&${r}>`);
        if (djs.length == 0) djs = "`Not Set`";
        else djs.slice(0, 15).join(", ");
        if (!newTrack) return new MessageEmbed()
            .setColor(emb.errColor)
            .setAuthor({ name: "NO SONG FOUND", iconURL: emb.disc.error })
            .setFooter({ text: newTrack.user.tag, iconURL: newTrack.user.displayAvatarURL({ dynamic: true }) });
        var embed = new MessageEmbed().setColor(emb.color).setTimestamp()
            .setDescription(`**[${newTrack.name}](${newTrack.url})**`)
            .addField(`${(newTrack.user === client.user) ? "💡 Autoplay by:" : "💡 Request by:"}`, `>>> ${newTrack.user}`, true)
            .addField(`⏱ Duration:`, `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``, true)
            .addField(`🌀 Queue:`, `>>> \`${newQueue.songs.length} song${newQueue.songs.length != 1 ? "s" : ""}\` - \`${newQueue.formattedDuration}\``, true)
            .addField(`🔊 Volume:`, `>>> \`${newQueue.volume} %\``, true)
            .addField(`♾ Loop:`, `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `${emoji.check}\` Queue\`` : `${emoji.check} \`Song\`` : `${emoji.x}`}`, true)
            .addField(`↪️ Autoplay:`, `>>> ${newQueue.autoplay ? `${emoji.check}` : `${emoji.x}`}`, true)
            .addField(`⬇ Download:`, `>>> [\`File Link\`](${newTrack.streamURL})`, true)
            .addField(`🎙 Filter${newQueue.filters.length != 1 ? "s" : ""}:`, `>>> ${newQueue.filters && newQueue.filters.length > 0 ? `${newQueue.filters.map(f => `\`${f}\``).join(`, `)}` : `${emoji.x}`}`, newQueue.filters.length > 2 ? false : true)
            .addField(`💿 DJ-Role${client.distubeSettings.get(newQueue.id, "djroles").length > 1 ? "s" : ""}:`, `>>> ${djs}`, (client.distubeSettings.get(newQueue.id, "djroles").length > 2 || djs != "`Not Set`") ? false : true)
            .setAuthor({ name: "DASHBOARD | NOW PLAYING", iconURL: emb.disc.spin })
            .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
            .setFooter({ text: newTrack.user.tag, iconURL: newTrack.user.displayAvatarURL({ dynamic: true }) });

        // Setup dashboard buttons
        let previous = new MessageButton().setStyle('PRIMARY').setCustomId('1').setEmoji('⏮').setLabel(`Previous`);
        let skip = new MessageButton().setStyle('PRIMARY').setCustomId('2').setEmoji(`⏭`).setLabel(`Skip`)
        let stop = new MessageButton().setStyle('DANGER').setCustomId('3').setEmoji(`⏹`).setLabel(`Stop`)
        let pause = new MessageButton().setStyle('SECONDARY').setCustomId('4').setEmoji('⏸').setLabel(`Pause`)
        let shuffle = new MessageButton().setStyle('PRIMARY').setCustomId('5').setEmoji('🔀').setLabel(`Shuffle`)
        let autoplay = new MessageButton().setStyle('SUCCESS').setCustomId('6').setEmoji('🔁').setLabel(`Autoplay`)
        let songloop = new MessageButton().setStyle('SUCCESS').setCustomId('7').setEmoji(`🔂`).setLabel(`Song`)
        let queueloop = new MessageButton().setStyle('SUCCESS').setCustomId('8').setEmoji(`🔁`).setLabel(`Queue`)
        let rewind = new MessageButton().setStyle('PRIMARY').setCustomId('9').setEmoji('⏪').setLabel(`-10 Sec`)
        let forward = new MessageButton().setStyle('PRIMARY').setCustomId('10').setEmoji('⏩').setLabel(`+10 Sec`)

        // Dashboard button actions
        if (newQueue.songs.length == 0) {
            skip = skip.setDisabled();
        } else {
            skip = skip.setDisabled(false);
        }
        if (!newQueue.previousSongs || newQueue.previousSongs.length == 0) {
            previous = previous.setDisabled();
        } else {
            previous = previous.setDisabled(false);
        }
        if (!newQueue.playing) {
            pause = pause.setStyle('SUCCESS').setEmoji('▶️').setLabel(`Resume`)
        }
        if (newQueue.autoplay) {
            autoplay = autoplay.setStyle('SECONDARY')
        }
        if (newQueue.repeatMode === 0) {
            songloop = songloop.setStyle('SUCCESS')
            queueloop = queueloop.setStyle('SUCCESS')
        }
        if (newQueue.repeatMode === 1) {
            songloop = songloop.setStyle('SECONDARY')
            queueloop = queueloop.setStyle('SUCCESS')
        }
        if (newQueue.repeatMode === 2) {
            songloop = songloop.setStyle('SUCCESS')
            queueloop = queueloop.setStyle('SECONDARY')
        }
        if (Math.floor(newQueue.currentTime) < 10) {
            rewind = rewind.setDisabled()
        } else {
            rewind = rewind.setDisabled(false)
        }
        if (Math.floor((newTrack.duration - newQueue.currentTime)) <= 10) {
            forward = forward.setDisabled()
        } else {
            forward = forward.setDisabled(false)
        }

        // Add buttons to message then send
        const row1 = new MessageActionRow().addComponents([previous, skip, stop, pause, shuffle]);
        const row2 = new MessageActionRow().addComponents([songloop, queueloop, autoplay, rewind, forward]);
        return {
            embeds: [embed],
            components: [row1, row2]
        };
    }


    /**
     * @param {*} queue The song queue
     * @param {Boolean} leave If the bot should leave the voice channel\
     * @returns Updates the dashboard & music system
     */
    async function updateMusicSystem(queue, leave = false) {
        if (!queue) return;
        if (client.distubeSettings.get(queue.id, `music.channel`) && client.distubeSettings.get(queue.id, `music.channel`).length > 5) {
            let messageId = client.distubeSettings.get(queue.id, `music.message`);

            // Try to get the guild
            let guild = client.guilds.cache.get(queue.id);
            if (!guild) return console.log(`Update-Music-System` + ` - Music System - Guild not found!`)

            // Try to get the channel
            let channel = guild.channels.cache.get(client.distubeSettings.get(queue.id, `music.channel`));
            if (!channel) channel = await guild.channels.fetch(client.distubeSettings.get(queue.id, `music.channel`)).catch(() => { }) || false
            if (!channel) return console.log(`Update-Music-System` + ` - Music System - Channel not found!`)
            if (!channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) return console.log(`Music System - Missing Permissions`)

            // Try to get the channel
            let message = channel.messages.cache.get(messageId);
            if (!message) message = await channel.messages.fetch(messageId).catch(() => { }) || false;
            if (!message) return console.log(`Update-Music-System` + ` - Music System - Message not found!`)

            // Edit the message to correct it
            var data = generateQueueEmbed(client, queue.id, leave)
            message.edit(data).catch((e) => {
                console.log(e)
            }).then(m => {
                console.log(`Update-Music-System` + ` - Edited the message due to a User Interaction`)
            })
        }
    }
};