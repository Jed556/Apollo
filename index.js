const { Client, Collection } = require("discord.js");
const { token  } = require("./config/client.json");

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

// Create client collections
client.commands = new Collection();
cooldowns = new Collection();

// Load the Handlers
["events", "commands"].forEach(h => {
    require(`./handlers/${h}`)(client);
})

//Start the Bot
client.login(process.env.token || token);