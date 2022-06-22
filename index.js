const { Client, Collection } = require('discord.js');
const { token } = require('./config/client.json');
const filters = require('./config/filters.json');
const {spotify_api, youtubeCookie, nsfwMusic} = require('./config/distube.json');
const DisTube = require('distube').default;
const https = require('https-proxy-agent');
const Enmap = require('enmap');

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
    intents: 131071,
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
let spotifyoptions = {
    parallel: true,
    emitEventsAfterFetching: true,
}

if (spotify_api.enabled) {
    spotifyoptions.api = {
        clientId: spotify_api.clientId,
        clientSecret: spotify_api.clientSecret,
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
    youtubeCookie: youtubeCookie,
    nsfw: nsfwMusic,
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
    youtubeDL: true,
    updateYouTubeDL: true,
    customFilters: filters,
    plugins: [
        new SpotifyPlugin(spotifyoptions),
        new SoundCloudPlugin()
    ]
})

// Create client collections
client.commands = new Collection();
cooldowns = new Collection();

client.distubeSettings = new Enmap({ name: "distubeSettings", dataDir: "./localDB/settings" });
client.infos = new Enmap({ name: "infos", dataDir: "./localDB/infos" });
client.autoresume = new Enmap({ name: "autoresume", dataDir: "./localDB/infos" });
client.maps = new Map();

// Load the Handlers
["events", "commands", "distubeEvent"].forEach(h => {
    require(`./handlers/${h}`)(client);
})

// Start the Bot
client.login(process.env.token || token);