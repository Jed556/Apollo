const { loadCommands } = require("../../handlers/commands");
const { loadFiles } = require("../../system/fileLoader");
const { toError } = require("../../system/functions");
const chalk = require('chalk')
const blurple = chalk.bold.hex("#7289da");
const { cyanBright, greenBright, yellow, red, bold, dim } = require('chalk');

module.exports = {
    name: "ready",
    once: true,

    run: async (client) => {
        let err = "", check = [];
        await loadCommands(client).catch(e => {
            const { stack } = e;
            if (stack.split(" ").includes("InstanceValidator.handle"))
                err = ", Please complete entering command data" + "\n    " + stack.split("\n")[6];
            else if (stack.split("\n").includes("Error: Invalid string format"))
                err = ", Please check your capitalization" + "\n    " + stack.split("\n")[7];
            else if (stack)
                err = "\n        " + stack.split("\n").map(l => `${l}\n    `).join("");
        })

        // Check for load errors
        const Files = await loadFiles("commands");
        Files.forEach((file) => { check.push(file) });
        if (client.commands.size < check.length)
            return console.log(toError(null, "Refreshing commands failed") + err);

        console.log(cyanBright.bold("[INFO]") + " Reloaded commands");
    }
}