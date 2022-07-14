
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const emb = require("../../config/embed.json");
const math = require("mathjs");

module.exports = {
    name: "calc",
    description: "Runs an interactive calculator",
    help: "/calc",
    cooldown: 60,
    permissions: [],
    allowedUIDs: [],
    options: [],

    run: async (client, interaction) => {
        try {

            let button = new Array([], [], [], [], []);
            let row = [];
            let text = [
                "Clear", "(", ")", "/", "⌫",
                "7", "8", "9", "*", "!",
                "4", "5", "6", "-", "^",
                "1", "2", "3", "+", "π",
                ".", "0", "00", "=", "Delete"
            ];
            let current = 0;

            for (let i = 0; i < text.length; i++) {
                if (button[current].length === 5) current++;
                button[current].push(createButton(text[i]));
                if (i === text.length - 1) {
                    for (let btn of button) row.push(addRow(btn));
                }
            }

            let value = 0;
            let valueFill = 40;

            const display = new MessageEmbed()
                .setColor(emb.color)
                .setDescription("```" + value + " ".repeat(value.toString().length < valueFill ? valueFill - value.toString().length : 0) + "```");

            await interaction.reply({
                embeds: [display],
                components: row
            }).then(async () => {
                const msg = await interaction.fetchReply();

                let isWrong = false;
                let time = 600000;
                let calEmb = new MessageEmbed()
                    .setColor(emb.color);

                function createCollector(val, result = false) {
                    const filter = (button) =>
                        button.user.id === interaction.user.id &&
                        button.customId === "cal" + val;
                    let collect = msg.createMessageComponentCollector({
                        filter,
                        componentType: "BUTTON",
                        time: time
                    });

                    collect.on("collect", async (x) => {
                        if (x.user.id !== interaction.user.id) return;
                        x.deferUpdate();

                        if (result === "new") value = "0";
                        else if (isWrong) {
                            value = val;
                            isWrong = false;
                        } else if (value === "0") value = val;
                        else if (result) {
                            isWrong = true;
                            value = mathEval(value);
                        } else value += val;

                        if (value.includes("⌫")) {
                            value = value.slice(0, -2);
                            if (value === "") value = " ";
                            calEmb.setDescription("```" + value + " ".repeat(value.toString().length < valueFill ? valueFill - value.toString().length : 0) + "```");
                            await msg.edit({
                                embeds: [calEmb],
                                components: row
                            });
                        } else if (value.includes("Delete"))
                            return interaction.deleteReply().catch(() => { });
                        else if (value.includes("Clear")) return (value = "0");
                        calEmb.setDescription("```" + value + " ".repeat(value.toString().length < valueFill ? valueFill - value.toString().length : 0) + "```");
                        await msg.edit({
                            embeds: [calEmb],
                            components: row
                        });
                    });
                }

                for (let txt of text) {
                    let result;

                    if (txt === "Clear") result = "new";
                    else if (txt === "=") result = true;
                    else result = false;
                    createCollector(txt, result);
                }
                setTimeout(async () => {
                    try {
                        emb1.setDescription(
                            "Your Time for using the calculator ran out (10 minutes)"
                        );
                        emb1.setColor(emb.errColor);
                        await msg.edit({ embeds: [calEmb], components: [] });
                    } catch { }
                }, time);
            });

            function addRow(btns) {
                let row1 = new MessageActionRow();
                for (let btn of btns) {
                    row1.addComponents(btn);
                }
                return row1;
            }

            function createButton(label, style = "SECONDARY") {
                if (label === "Clear") style = "DANGER";
                else if (label === "Delete") style = "DANGER";
                else if (label === "⌫") style = "DANGER";
                else if (label === "π") style = "SECONDARY";
                else if (label === "!") style = "SECONDARY";
                else if (label === "^") style = "SECONDARY";
                else if (label === ".") style = "PRIMARY";
                else if (label === "=") style = "SUCCESS";
                else if (isNaN(label)) style = "PRIMARY";
                const btn = new MessageButton()
                    .setLabel(label)
                    .setStyle(style)
                    .setCustomId("cal" + label);
                return btn;
            }

            function mathEval(input) {
                try {
                    let res = `${input} = ${math.evaluate(input.replace("π", math.pi))}`;
                    return res;
                } catch {
                    return "Wrong Input";
                }
            }
        } catch (e) {
            console.log(String(e.stack));
        }
    }
}