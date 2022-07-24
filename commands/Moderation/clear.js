const { EmbedBuilder } = require('discord.js');
const emb = require('../../config/embed.json');

module.exports = {
    name: "clear",
    description: "Bulk deletes messages",
    help: "/clear [amount] (user)",
    cooldown: 5,
    permissions: ["MANAGE_MESSAGES"],
    allowedUIDs: [],
    options: [
        {
            name: "amount",
            description: "Amount of messages to delete",
            type: 4,
            required: false,
        },
        {
            name: "user",
            description: "Clear mentioned user's messages",
            type: 6,
            required: false
        }
    ],

    run: async (client, interaction) => {
        const { channel, options } = interaction;
        const Amount = options.getInteger("amount");
        const Target = options.getUser("user");
        const Messages = channel.messages.fetch();

        var embed = new EmbedBuilder()
            .setTimestamp()
            .setColor(emb.color)
            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

        if (Amount <= 100) {
            if (Target) {
                let i = 0;
                const filtered = [];
                (await Messages).filter((m) => {
                    if (m.author.id === Target.id && Amount > i) {
                        filtered.push(m);
                        i++;
                    }
                });
                await channel.bulkDelete(filtered, true).then(msgs => {
                    interaction.reply({
                        embeds: [embed
                            .setDescription(`**Deleted ${msgs.size} messages sent by ${Target}**`)],
                        ephemeral: true
                    });
                })
            } else {
                await channel.bulkDelete(Amount, true).then(msgs => {
                    interaction.reply({
                        embeds: [embed
                            .setDescription(`**Deleted ${msgs.size} messages in ${channel}**`)],
                        ephemeral: true
                    });
                });
            }
        } else {
            if (Target) {
                let i = 0;
                const filtered = [];
                (await Messages).filter((m) => {
                    if (m.author.id === Target.id && Amount > i) {
                        filtered.push(m);
                        i++;
                    }
                });
                await channel.bulkDelete(filtered, true).then(msgs => {
                    interaction.reply({
                        embeds: [embed
                            .setDescription(`**Deleted ${msgs.size} messages sent by ${Target}**`)],
                        ephemeral: true
                    });
                });
            } else {
                var iBulk = 1;
                const amt = Math.ceil(Amount / 100);
                interaction.reply({
                    embeds: [embed.setDescription("**Deleting Messages...**")],
                    ephemeral: true
                });
                try {
                    msgsArray = [];
                    while (amt > iBulk) {
                        await channel.bulkDelete(100, true).then(msgs => {
                            if (msgs.size > 0) {
                                interaction.editReply({
                                    embeds: [embed
                                        .setDescription(`**Deleted ${msgs.size} message${(msgs.size > 1 || msgs.size == 0) ? "s" : ""} in ${channel}** \`Loop: [${iBulk}/${amt}]\``)],
                                });
                                msgsArray.push(msgs.size);
                            } else return;
                        });
                        iBulk++;
                        await new Promise(r => setTimeout(r, 3500));
                    }

                    const sum = await msgsArray.reduce(function (a, v) { return a + v; }, 0);
                    await interaction.editReply({
                        embeds: [embed
                            .setDescription(`**${(sum < 1) ? `No messages deleted in ${channel}` : `Done deleting ${sum} message${(sum > 1) ? "s" : ""} in ${channel}`}**`)],
                    });
                } catch { }
            }
        }
    }
}