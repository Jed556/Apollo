const
    { ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js'),
    { distubeValidate } = require('../system/distubeFunctions'),
    emb = require('../config/embed.json'),
    emoji = require('../config/emojis.json'),
    FiltersSettings = require('../config/filters.json'),
    playerintervals = new Map(),
    PlayerMap = new Map();
let
    songEditInterval = null,
    endCheck = false;

// Variable checks (Use .env if present)
require('dotenv').config();
let settings;
if (process.env.musicRequestEditDelay) {
    settings = {
        "music-request-edit-delay": process.env.musicRequestEditDelay
    };
} else {
    settings = require('../config/distube.json');
}

/**
 * 
 * @param {*} client Discord client
 */
async function distubeEvent(client) {
    try {
        client.distube
            .on(`playSong`, async (queue, track) => {
                try {
                    if (!client.guilds.cache.get(queue.id).members.me.voice.deaf)
                        client.guilds.cache.get(queue.id).members.me.voice.setDeaf(true).catch((e) => {
                            //console.log(e.stack ? String(e.stack) : String(e))
                        });
                } catch (error) {
                    console.log(error);
                }
                try {
                    var newQueue = client.distube.getQueue(queue.id),
                        oldLoop = newQueue.repeatMode;
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

                    // Edit status check
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

                        const
                            errorEmb = new EmbedBuilder()
                                .setTimestamp()
                                .setColor(emb.errColor)
                                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) }),

                            successEmb = new EmbedBuilder()
                                .setTimestamp()
                                .setColor(emb.color)
                                .setFooter({ text: `Action by: ${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })

                        // Validate if user can execute the command
                        if (i.customId != `10`) {
                            const validate = await distubeValidate(i, newQueue, ["DJ"]);
                            if (validate) return;
                        }

                        lastEdited = true;
                        setTimeout(() => {
                            lastEdited = false
                        }, 7000)

                        // ---------------------------------------- PREVIOUS ---------------------------------------- //
                        if (i.customId == `1`) {
                            // Validate if user can execute the command
                            const validate = await distubeValidate(i, newQueue, ["channel", "playing", "previous"]);
                            if (validate) return;

                            await newQueue.previous();
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: "PLAYING PREVIOUS SONG", iconURL: emb.disc.previous })
                                ]
                            })
                        }


                        // ---------------------------------------- SKIP ---------------------------------------- //
                        if (i.customId == `2`) {
                            // Validate if user can execute the command
                            const validate = await distubeValidate(i, newQueue, ["channel", "playing", "skip"]);
                            if (validate) return clearInterval(songEditInterval);

                            // Skip the track
                            await client.distube.skip(i.guild.id);
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: "SKIPPED TO NEXT SONG", iconURL: emb.disc.skip })
                                ]
                            });
                        }

                        // ---------------------------------------- STOP ---------------------------------------- //
                        if (i.customId == `3`) {
                            // Validate if user can execute the command
                            const validate = await distubeValidate(i, newQueue, ["channel"]);
                            if (validate) return;

                            // Stop the track
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: "STOPPED PLAYING", iconURL: emb.disc.stop })
                                    .setDescription(`**STOPPED THE PLAYER & LEFT THE VOICE CHANNEL**`)
                                ]
                            });
                            clearInterval(songEditInterval);
                            // Edit the current song message
                            stopCheck = true;
                            await client.distube.stop(i.guild.id);
                        }

                        // ---------------------------------------- PAUSE & RESUME ---------------------------------------- //
                        if (i.customId == `4`) {
                            // Validate if user can execute the command
                            const validate = await distubeValidate(i, newQueue, ["channel"]);
                            if (validate) return;

                            if (newQueue.playing) {
                                await client.distube.pause(i.guild.id);
                                var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0]);
                                currentSongPlayMsg.edit(data).catch((e) => {
                                    //console.log(e.stack ? String(e.stack): String(e))
                                });
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "PAUSED", iconURL: emb.disc.pause })
                                    ]
                                });
                            } else {
                                // Pause the player
                                await client.distube.resume(i.guild.id);
                                var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0]);
                                currentSongPlayMsg.edit(data).catch((e) => {
                                    //console.log(e.stack ? String(e.stack): String(e))
                                });
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "RESUMED", iconURL: emb.disc.resume })
                                    ]
                                });
                            }
                        }

                        // ---------------------------------------- SHUFFLE ---------------------------------------- //
                        if (i.customId == `5`) {
                            // Validate if user can execute the command
                            const validate = await distubeValidate(i, newQueue, ["channel"]);
                            if (validate) return;

                            client.maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
                            // Pause the player
                            await newQueue.shuffle();
                            //Send Success Message
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: `SHUFFELED  ${newQueue.songs.length} SONGS`, iconURL: emb.disc.shuffle })
                                ]
                            });
                        }


                        // ---------------------------------------- AUTOPLAY ---------------------------------------- //
                        if (i.customId == `6`) {
                            // Validate if user can execute the command
                            const validate = await distubeValidate(i, newQueue, ["channel"]);
                            if (validate) return;

                            // Pause the player
                            await newQueue.toggleAutoplay()
                            if (newQueue.autoplay) {
                                var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                                currentSongPlayMsg.edit(data).catch((e) => {
                                    //console.log(e.stack ? String(e.stack): String(e))
                                });
                            } else {
                                var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                                currentSongPlayMsg.edit(data).catch((e) => {
                                    //console.log(e.stack ? String(e.stack): String(e))
                                });
                            }
                            // Send Success Message
                            if (newQueue.autoplay) {
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "ENABLED AUTOPLAY", iconURL: emb.disc.autoplay.on })
                                    ]
                                });
                            } else {
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "DISABLED AUTOPLAY", iconURL: emb.disc.autoplay.off })
                                    ]
                                });
                            }
                        }

                        // ---------------------------------------- SONG LOOP ---------------------------------------- //
                        if (i.customId == `7`) {
                            // Validate if user can execute the command
                            const validate = await distubeValidate(i, newQueue, ["channel"]);
                            if (validate) return;

                            // Disable the Repeatmode
                            if (newQueue.repeatMode == 1) {
                                await newQueue.setRepeatMode(0)
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "DISABLED SONG LOOP", iconURL: emb.disc.loop.none })
                                    ]
                                })
                            }
                            // Enable loop
                            else {
                                await newQueue.setRepeatMode(1)
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: `${oldLoop == 0 ? "ENABLED SONG" : "DISABLED QUEUE LOOP & ENABLED SONG"} LOOP`, iconURL: emb.disc.loop.song })
                                    ]
                                })
                            }

                            var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                            currentSongPlayMsg.edit(data).catch((e) => { /*console.log(e.stack ? String(e.stack): String(e))*/ })
                        }

                        // ---------------------------------------- QUEUE LOOP ---------------------------------------- //
                        if (i.customId == `8`) {
                            // Validate if user can execute the command
                            const validate = await distubeValidate(i, newQueue, ["channel"]);
                            if (validate) return;

                            //Disable the Repeatmode
                            if (newQueue.repeatMode == 2) {
                                await newQueue.setRepeatMode(0)
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: "DISABLED QUEUE LOOP", iconURL: emb.disc.loop.none })
                                    ]
                                })
                            }
                            //Enable it
                            else {
                                await newQueue.setRepeatMode(2)
                                i.reply({
                                    embeds: [successEmb
                                        .setAuthor({ name: `${oldLoop == 0 ? "ENABLED QUEUE" : "DISABLED SONG LOOP & ENABLED QUEUE"} LOOP`, iconURL: emb.disc.loop.queue })
                                    ]
                                })
                            }

                            var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                            currentSongPlayMsg.edit(data).catch((e) => { /*console.log(e.stack ? String(e.stack): String(e))*/ })
                        }

                        // ---------------------------------------- REWIND ---------------------------------------- //
                        if (i.customId == `9`) {
                            // Validate if user can execute the command
                            const validate = await distubeValidate(i, newQueue, ["channel"]);
                            if (validate) return;

                            let seektime = newQueue.currentTime - 10;
                            if (seektime < 0) seektime = 0;
                            if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
                            await newQueue.seek(Number(seektime))
                            collector.resetTimer({ time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000 })
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: "REWINDED FOR 10 SECONDS", iconURL: emb.disc.rewind })
                                ]
                            })

                            var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                            currentSongPlayMsg.edit(data).catch((e) => {/*console.log(e.stack ? String(e.stack): String(e))*/ })
                        }

                        // ---------------------------------------- FORWARD ---------------------------------------- //
                        if (i.customId == `10`) {
                            // Validate if user can execute the command
                            const validate = await distubeValidate(i, newQueue, ["channel"]);
                            if (validate) return;

                            let seektime = newQueue.currentTime + 10;
                            if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
                            await newQueue.seek(Number(seektime))
                            collector.resetTimer({ time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000 })
                            i.reply({
                                embeds: [successEmb
                                    .setAuthor({ name: "FORWARDED FOR 10 SECONDS", iconURL: emb.disc.forward })
                                ]
                            })

                            var data = receiveQueueData(client.distube.getQueue(newQueue.id), newQueue.songs[0])
                            currentSongPlayMsg.edit(data).catch((e) => { /*console.log(e.stack ? String(e.stack) : String(e))*/ })
                        }
                        setTimeout(() => i.deleteReply().catch(e => console.log(e)), 5000);
                    });
                } catch (error) {
                    console.log(error)
                }
            })

            // If a song was added to the queue
            .on(`addSong`, (queue, song) => {
                updateMusicSystem(queue);
                queue.textChannel.send({
                    embeds: [new EmbedBuilder()
                        .setTimestamp()
                        .setColor(emb.color)
                        .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
                        .setFooter({ text: song.user.tag, iconURL: song.user.displayAvatarURL({ dynamic: true }) })
                        .setAuthor({ name: "SONG ADDED TO QUEUE", iconURL: emb.disc.song.add })
                        .setDescription(`Song: [\`${song.name}\`](${song.url})  -  \`${song.formattedDuration}\``)
                        .setFields([
                            { name: `⌛ **Estimated Time:**`, value: `\`${queue.songs.length - 1} song${queue.songs.length != 1 ? "s" : ""}\` - \`${(Math.floor((queue.duration - song.duration) / 60 * 100) / 100).toString().replace(".", ":")}\`` },
                            { name: `🌀 **Queue Duration:**`, value: `\`${queue.formattedDuration}\`` }
                        ])
                    ]
                })
            })

            // If a song was added to a list
            .on(`addList`, (queue, playlist) => {
                updateMusicSystem(queue);
                queue.textChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTimestamp()
                            .setColor(emb.color)
                            .setThumbnail(playlist.thumbnail.url ? playlist.thumbnail.url : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`)
                            .setFooter({ text: playlist.user.tag, iconURL: playlist.user.displayAvatarURL({ dynamic: true }) })
                            .setAuthor({ name: "PLAYLIST ADDED TO QUEUE", iconURL: emb.disc.song.add })
                            .setDescription(`Playlist: [\`${playlist.name}\`](${playlist.url ? playlist.url : ""})  -  \`${playlist.songs.length} Song${playlist.songs.length != 0 ? "s" : ""}\``)
                            .setFields([
                                { name: `⌛ **Estimated Time:**`, value: `\`${queue.songs.length - - playlist.songs.length} song${queue.songs.length != 1 ? "s" : ""}\` - \`${(Math.floor((queue.duration - playlist.duration) / 60 * 100) / 100).toString().replace(".", ":")}\`` },
                                { name: `🌀 **Queue Duration:**`, value: `\`${queue.formattedDuration}\`` }
                            ])
                    ]
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
                    embeds: [new EmbedBuilder()
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
                var embed = new EmbedBuilder()
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
                var embed = new EmbedBuilder()
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
                            embeds: [new EmbedBuilder()
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
                    queue.filters.set(data.defaultfilters);

                    // Check-Relevant-Messages inside of the Music System Request Channel
                    var checkrelevantinterval = setInterval(async () => {
                        if (client.distubeSettings.get(queue.id, `music.channel`) && client.distubeSettings.get(queue.id, `music.channel`).length > 5) {
                            console.log(`Music System - Relevant Checker` + ` - Checkingfor unrelevant Messages`)
                            let messageId = client.distubeSettings.get(queue.id, `music.message`);

                            // Try to get the guild
                            let guild = client.guilds.cache.get(queue.id);
                            if (!guild) return console.log(`Music System - Relevant Checker` + ` - Guild not found!`)

                            // Try to get the channel
                            let channel = guild.channels.cache.get(client.distubeSettings.get(queue.id, `music.channel`));
                            if (!channel) channel = await guild.channels.fetch(client.distubeSettings.get(queue.id, `music.channel`)).catch(() => { }) || false
                            if (!channel) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Channel not found!`)
                            if (!channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.MANAGE_MESSAGES)) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Missing Permissions`)

                            // Try to get the channel
                            let messages = await channel.messages.fetch();
                            if (messages.filter(m => m.id != messageId).size > 0) {
                                channel.bulkDelete(messages.filter(m => m.id != messageId)).catch(() => { })
                                    .then(messages => console.log(`Music System - Relevant Checker` + ` - Bulk deleted ${messages.size} messages`))
                            } else {
                                console.log(`Music System - Relevant Checker` + ` - No Relevant Messages`)
                            }
                        }
                    }, settings["music-system-relevant-checker-delay"] || 60000);
                    playerintervals.set(`checkrelevantinterval-${queue.id}`, checkrelevantinterval);

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
        if (!newTrack) return new EmbedBuilder()
            .setColor(emb.errColor)
            .setAuthor({ name: "NO SONG FOUND", iconURL: emb.disc.error })
            .setFooter({ text: newTrack.user.tag, iconURL: newTrack.user.displayAvatarURL({ dynamic: true }) });

        let filterList = []
        for (var f in FiltersSettings) {
            if (newQueue.filters.has(f)) filterList.push(f);
        }

        var embed = new EmbedBuilder().setColor(emb.color).setTimestamp()
            .setDescription(`**[${newTrack.name}](${newTrack.url})**`)
            .setFields([
                { name: `${(newTrack.user === client.user) ? "💡 Autoplay by:" : "💡 Request by:"}`, value: `>>> ${newTrack.user}`, inline: true },
                { name: `⏱ Duration:`, value: `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``, inline: true },
                { name: `🌀 Queue:`, value: `>>> \`${newQueue.songs.length} song${newQueue.songs.length != 1 ? "s" : ""}\` - \`${newQueue.formattedDuration}\``, inline: true },
                { name: `🔊 Volume:`, value: `>>> \`${newQueue.volume} %\``, inline: true },
                { name: `♾ Loop:`, value: `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `${emoji.switch.on}\` Queue\`` : `${emoji.switch.on} \`Song\`` : `${emoji.switch.off}`}`, inline: true },
                { name: `↪️ Autoplay:`, value: `>>> ${newQueue.autoplay ? `${emoji.switch.on}` : `${emoji.switch.off}`}`, inline: true },
                { name: `⬇ Download:`, value: `>>> [\`File Link\`](${newTrack.streamURL})`, inline: true },
                { name: `🎙 Filter${filterList.length != 1 ? "s" : ""}:`, value: `>>> ${filterList && filterList.length > 0 ? `${filterList.map(f => `\`${f}\``).join(`, `)}` : `${emoji.x}`}`, inline: filterList.length > 2 ? false : true },
                { name: `💿 DJ-Role${client.distubeSettings.get(newQueue.id, "djroles").length > 1 ? "s" : ""}:`, value: `>>> ${djs}`, inline: (client.distubeSettings.get(newQueue.id, "djroles").length > 2 || djs != "`Not Set`") ? false : true }
            ])
            .setAuthor({ name: "DASHBOARD | NOW PLAYING", iconURL: emb.disc.spin })
            .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
            .setFooter({ text: newTrack.user.tag, iconURL: newTrack.user.displayAvatarURL({ dynamic: true }) });

        // Setup dashboard buttons
        let previous = new ButtonBuilder().setStyle("Primary").setCustomId("1").setEmoji("⏮").setLabel("Previous");
        let skip = new ButtonBuilder().setStyle("Primary").setCustomId("2").setEmoji("⏭").setLabel("Skip")
        let stop = new ButtonBuilder().setStyle("Danger").setCustomId("3").setEmoji("⏹").setLabel("Stop")
        let pause = new ButtonBuilder().setStyle("Secondary").setCustomId("4").setEmoji("⏸").setLabel("Pause")
        let shuffle = new ButtonBuilder().setStyle("Primary").setCustomId("5").setEmoji("🔀").setLabel("Shuffle")
        let autoplay = new ButtonBuilder().setStyle("Success").setCustomId("6").setEmoji("🔁").setLabel("Autoplay")
        let songloop = new ButtonBuilder().setStyle("Success").setCustomId("7").setEmoji("🔂").setLabel("Song")
        let queueloop = new ButtonBuilder().setStyle("Success").setCustomId("8").setEmoji("🔁").setLabel("Queue")
        let rewind = new ButtonBuilder().setStyle("Primary").setCustomId("9").setEmoji("⏪").setLabel("-10 Sec")
        let forward = new ButtonBuilder().setStyle("Primary").setCustomId("10").setEmoji("⏩").setLabel("+10 Sec")

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
            pause = pause.setStyle("Success").setEmoji("▶️").setLabel("Resume")
        }
        if (newQueue.autoplay) {
            autoplay = autoplay.setStyle("Secondary")
        }
        if (newQueue.repeatMode === 0) {
            songloop = songloop.setStyle("Success")
            queueloop = queueloop.setStyle("Success")
        }
        if (newQueue.repeatMode === 1) {
            songloop = songloop.setStyle("Secondary")
            queueloop = queueloop.setStyle("Success")
        }
        if (newQueue.repeatMode === 2) {
            songloop = songloop.setStyle("Success")
            queueloop = queueloop.setStyle("Secondary")
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
        const row1 = new ActionRowBuilder().addComponents([previous, skip, stop, pause, shuffle]);
        const row2 = new ActionRowBuilder().addComponents([songloop, queueloop, autoplay, rewind, forward]);
        return {
            embeds: [embed],
            components: [row1, row2]
        };
    }


    /**
     * @param {*} queue The song queue
     * @param {Boolean} leave If the bot should leave the voice channel
     * @returns Updates the dashboard & music system
     */
    async function updateMusicSystem(queue, leave = false) {
        if (!queue) return;
        if (client.distubeSettings.get(queue.id, "music.channel") && client.distubeSettings.get(queue.id, "music.channel").length > 5) {
            let messageId = client.distubeSettings.get(queue.id, "music.message");

            // Try to get the guild
            let guild = client.guilds.cache.get(queue.id);
            if (!guild) return console.log("Update-Music-System" + " - Music System - Guild not found!")

            // Try to get the channel
            let channel = guild.channels.cache.get(client.distubeSettings.get(queue.id, "music.channel"));
            if (!channel) channel = await guild.channels.fetch(client.distubeSettings.get(queue.id, "music.channel")).catch(() => { }) || false
            if (!channel) return console.log("Update-Music-System" + " - Music System - Channel not found!")
            if (!channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) return console.log("Music System - Missing Permissions")

            // Try to get the channel
            let message = channel.messages.cache.get(messageId);
            if (!message) message = await channel.messages.fetch(messageId).catch(() => { }) || false;
            if (!message) return console.log("Update-Music-System" + " - Music System - Message not found!")

            // Edit the message to correct it
            var data = generateQueueEmbed(client, queue.id, leave)
            message.edit(data).catch((e) => {
                console.log(e)
            }).then(m => {
                console.log("Update-Music-System" + " - Edited the message due to a User Interaction")
            })
        }
    }
};

module.exports = { distubeEvent };