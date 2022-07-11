const { MessageEmbed } = require('discord.js');
const emb = require('../../config/embed.json');
const chalk = require('chalk')
const blurple = chalk.bold.hex("#7289da");
var Heroku = require('heroku-client');
let os = require('os');

// Variable checks (Use .env if present)
require('dotenv').config();
let OwnerID, Token, AppName, DynoName;
if (process.env.ownerID && process.env.herokuToken && process.env.herokuApp && process.env.herokuDyno) {
    OwnerID = process.env.ownerID;
    Token = process.env.herokuToken;
    AppName = process.env.herokuApp;
    DynoName = process.env.herokuDyno;
} else {
    const { ownerID } = require('../../config/client.json');
    const { herokuToken, herokuApp, herokuDyno } = require('../../config/heroku.json');
    OwnerID = ownerID;
    Token = herokuToken;
    AppName = herokuApp;
    DynoName = herokuDyno;
}

module.exports = {
    name: "restart",
    description: "Perform Apollø global restart",
    help: "/restart (countdown)",
    cooldown: 0,
    permissions: [],
    allowedUIDs: [OwnerID],
    options: [
        {
            name: "countdown",
            description: "Countdown before restarting (seconds)",
            type: 4,
            required: false,
        }
    ],

    run: async (client, interaction) => {
        try {
            const cd = interaction.options.getInteger("countdown");
            if (os.hostname().length != 36)
                return interaction.reply({
                    embeds: [new MessageEmbed()
                        .setTimestamp()
                        .setColor(emb.errColor)
                        .setAuthor({ name: "HEROKU | restart.js", iconURL: emb.heroku })
                        .setDescription(`**${client.user.username} is not hosted in heroku**`)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    ],
                    ephemeral: true
                });

            interaction.reply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.color)
                    .setAuthor({ name: "HEROKU | restart.js", iconURL: emb.heroku })
                    .setDescription(`**Restarting ${client.user.username}${cd ? ` in ${cd} sec${cd != 1 ? "s" : ""}` : "..."}**`)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            });

            if (cd)
                setTimeout(async () => {
                    var heroku = new Heroku({ token: Token });
                    heroku.delete('/apps/' + AppName + '/dynos/' + DynoName)
                        .then(x => console.log(x));
                }, cd * 1000);
            else interaction.reply({
                embeds: [new MessageEmbed()
                    .setTimestamp()
                    .setColor(emb.errColor)
                    .setAuthor({ name: "HEROKU | restart.js", iconURL: emb.heroku })
                    .setDescription(`**${client.user.username} is currently not hosted by Heroku**`)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                ],
                ephemeral: true
            });
            console.log(blurple("[HEROKU]") + ` Restarting ${AppName}: ${DynoName}`)
        } catch (e) {
            console.log(String(e.stack));
        }
    }
}