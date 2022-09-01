const
    { ActivityType } = require('discord.js'),
    { randomNum } = require('../../system/functions'),
    DB = require('../../schemas/Status'),
    os = require('os');

module.exports = {
    name: "ready",
    once: true,

    run: async (client) => {
        try {
            setTimeout(() => {
                setInterval(() => {
                    // Find matching database data
                    const docs = DB.findOne({
                        _id: client.user.id,
                    });

                    if (!docs.maintenance) { // Check if under maintenance
                        client.user.setStatus("online");
                        const
                            Guilds = client.guilds.cache.size,
                            Users = client.users.cache.filter(user => !user.bot).size;
                        let display = randomNum(1, 5);

                        switch (display) {
                            // Set status as guild count
                            case 0:
                                if (Guilds > 1 || Guilds < 1) {
                                    client.user.setActivity(`${Guilds} Servers`,
                                        { type: ActivityType.Listening });
                                } else {
                                    client.user.setActivity(`${Guilds} Server`,
                                        { type: ActivityType.Listening });
                                }
                                break;

                            // Set status as user count
                            case 1:
                                if (Users > 999) {
                                    client.user.setActivity(`${Math.ceil(Users / 1000)}K Members`,
                                        { type: ActivityType.Listening });
                                } else if (Users > 1 || Users < 1) {
                                    client.user.setActivity(`${Math.ceil(Users)} Members`,
                                        { type: ActivityType.Listening });
                                } else {
                                    client.user.setActivity(`${Math.ceil(Users)} Member `,
                                        { type: ActivityType.Listening });
                                }
                                break;

                            // Set status as random 1
                            case 2:
                                client.user.setActivity(`Slash Commands`,
                                    { type: ActivityType.Watching });
                                break;

                            // Set status as random 2
                            case 3:
                                client.user.setActivity(`my DMs ✉`,
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
                                const cpus = os.cpus();
                                const cpu = cpus[0];

                                // Accumulate every CPU times values
                                const total = Object.values(cpu.times)
                                    .reduce((acc, tv) => acc + tv, 0);

                                // Calculate the CPU usage
                                const usage = process.cpuUsage();
                                const currentCPUUsage = (usage.user + usage.system) * 1000;
                                const cpuPerc = currentCPUUsage / total * 100;

                                client.user.setActivity(`CPU: ${(cpuPerc / 1000).toFixed(1)}%`,
                                    { type: ActivityType.Watching });
                                break;
                        }
                    } else {
                        // Set status as under maintenance
                        client.user.setStatus("dnd");
                        client.user.setActivity(`MAINTENANCE`, { type: ActivityType.Watching });
                    }
                }, 5000);
            }, randomNum(1, 5)) // randTime is a random number between 1 and 5 seconds
        } catch (e) {
            console.log(toError(e, "Status Error"))
        }
    }
}