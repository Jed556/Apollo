const
    { ActivityType } = require('discord.js'),
    { randomNum } = require('../../system/functions'),
    DB = require('../../schemas/Status'),
    os = require('os'),
    osUtils = require('os-utils');

module.exports = {
    name: "ready",
    once: true,

    run: async (client) => {
        try {
            let
                count,
                display = 1,
                prevDisplay1 = 0,
                prevDisplay2 = 0;

            setInterval(async () => {
                // Find matching database data
                const docs = await DB.findOne({
                    _id: client.user.id
                });

                if (!client.cmdOk || !client.dbOk || !client.evtOk) {
                    client.user.setStatus("idle");
                    client.user.setActivity("Deployment", { type: ActivityType.Watching });
                } else if (!docs.maintenance) { // Check if under maintenance
                    client.user.setStatus("online");
                    const
                        Guilds = client.guilds.cache.size,
                        Users = client.users.cache.filter(user => !user.bot).size;

                    switch (display) {
                        // Set status as guild count
                        case 0:
                            client.user.setActivity(`${Guilds} Server ${Guilds > 1 || Guilds < 1 ? "s" : ""}`,
                                { type: ActivityType.Listening });
                            break;

                        // Set status as user count
                        case 1:
                            if (Users > 999)
                                count = Math.ceil(Users / 1000) + "K Members";
                            else if (Users > 1 || Users < 1)
                                count = Math.ceil(Users) + " Members";
                            else
                                count = Math.ceil(Users) + " Member";

                            client.user.setActivity(count,
                                { type: ActivityType.Listening });
                            break;

                        // Set status as random 1
                        case 2:
                            client.user.setActivity("Slash Commands",
                                { type: ActivityType.Watching });
                            break;

                        // Set status as random 2
                        case 3:
                            client.user.setActivity("my DMs ✉",
                                { type: ActivityType.Watching });
                            break;

                        // Set status as RAM usage
                        case 4:
                            // Calculate memory usage
                            const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

                            client.user.setActivity(`RAM: ${memUsage}MB`,
                                { type: ActivityType.Watching });
                            break;

                        // Set status as CPU usage
                        case 5:
                            osUtils.cpuUsage((v) => {
                                client.user.setActivity(`CPU: ${(v * 100).toFixed(1)}%`,
                                    { type: ActivityType.Watching });
                            });
                            break;
                    }
                } else {
                    // Set status as under maintenance
                    client.user.setStatus("dnd");
                    client.user.setActivity("MAINTENANCE", { type: ActivityType.Watching });
                }

                // Randomize next status
                prevDisplay2 = prevDisplay1;
                prevDisplay1 = display;
                while (display == prevDisplay1 || display == prevDisplay2)
                    display = randomNum(0, 3);

            }, (randomNum(5, 10)) * 1000) // Random number between 5 and 10 seconds
        } catch (e) {
            console.log(toError(e, "Status Error"))
        }
    }
}