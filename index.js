const { Client, Collection, IntentsBitField, Partials } = require('discord.js');
const filters = require('./config/filters.json');
const DisTube = require('distube').default;
const https = require('https-proxy-agent');
const Enmap = require('enmap');

// Variable checks (Use .env if present)
let Token, spotifyAPI, nsfw, youtubeCookie;
require('dotenv').config();
if (process.env.token && process.env.spotifyEnabled && process.env.spotifySecret && process.env.spotifyID && process.env.nsfwMusic && process.env.youtubeCookie) {
    Token = process.env.token;
    nsfw = process.env.nsfwMusic === 'true';
    youtubeCookie = process.env.youtubeCookie;
    spotifyAPI = {
        enabled: process.env.spotifyEnabled === 'true',
        clientSecret: process.env.spotifySecret,
        clientId: process.env.spotifyID
    };
} else {
    const { token } = require('./config/client.json');
    const { spotify_api, ytCookie, nsfwMusic } = require('./config/distube.json');
    Token = token;
    youtubeCookie = ytCookie;
    nsfw = nsfwMusic;
    spotifyAPI = spotify_api;
}

const client = new Client({
    fetchAllMembers: false,
    //restTimeOffset: 0,
    //restWsBridgetimeout: 100,
    shards: "auto",
    //shardCount: 5,
    allowedMentions: {
        parse: [],
        repliedUser: false,
    },
    failIfNotExists: false,
    intents: [new IntentsBitField(98303)],
    presence: {
        activities: [{
            name: "Deployment",
            type: "WATCHING",
        }],
        status: "idle"
    }
});

// DISTUBE
//const proxy = 'http://123.123.123.123:8080';
//const agent = https(proxy);
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');

let spotifyoptions = {
    parallel: true,
    emitEventsAfterFetching: true,
}

if (spotifyAPI.enabled) {
    spotifyoptions.api = {
        clientId: spotifyAPI.clientId,
        clientSecret: spotifyAPI.clientSecret,
    }
}

client.distube = new DisTube(client, {
    emitNewSongOnly: false,
    leaveOnEmpty: true,
    leaveOnFinish: true,
    leaveOnStop: true,
    savePreviousSongs: true,
    emitAddSongWhenCreatingQueue: false,
    //emitAddListWhenCreatingQueue: false,
    searchSongs: 0,
    youtubeCookie,
    nsfw,
    emptyCooldown: 25,
    ytdlOptions: {
        // requestOptions: {
        //  agent //ONLY USE ONE IF YOU KNOW WHAT YOU DO
        // },
        highWaterMark: 1024 * 1024 * 64,
        quality: "highestaudio",
        format: "audioonly",
        liveBuffer: 75000,
        dlChunkSize: 1024 * 1024 * 4,
    },
    customFilters: filters,
    plugins: [
        new SpotifyPlugin(spotifyoptions),
        new SoundCloudPlugin(),
        new YtDlpPlugin({
            updateYouTubeDL: true
        })
    ]
});

// Create client collections
client.commands = new Collection();
client.events = new Collection();

client.distubeSettings = new Enmap({ name: "distubeSettings", dataDir: "./localDB/settings" });
client.infos = new Enmap({ name: "infos", dataDir: "./localDB/infos" });
client.autoresume = new Enmap({ name: "autoresume", dataDir: "./localDB/infos" });
client.maps = new Map();

// Load the Handlers
const
    { loadEvents } = require('./handlers/events'),
    { distubeEvent } = require('./handlers/distubeEvent'),
    handlers = [loadEvents, distubeEvent];

// Start the Bot
handlers.forEach(handler => {
    handler(client);
});
client.login(Token);