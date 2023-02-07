const
    { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js"),
    { toError } = require('../../system/functions'),
    emb = require("../../config/embed.json");

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("tic-tac-toe")
            .setDescription("Play tic tac toe with someone")
            .setDefaultMemberPermissions()
            .setDMPermission(false)
            .addUserOption(option => option
                .setName("opponent")
                .setDescription("Pick your opponent")
                .setRequired(true)
            ),
        help: "/tic-tac-toe [opponent]",
        cooldown: 3,
        allowedUIDs: [],

        run: async (client, interaction) => {
            let opponent = interaction.options.getUser("opponent");

            // Run opponent checks
            if (!opponent)
                return interaction.reply({
                    content: "No opponent mentioned!",
                    ephemeral: true
                });
            if (opponent.bot)
                return interaction.reply({
                    content: "You can't play against bots",
                    ephemeral: true
                });
            if (opponent.id == interaction.user.id)
                return interaction.reply({
                    content: "You cannot play by yourself!",
                    ephemeral: true
                });

            interaction.deferReply("Starting...");

            // Setup Embed
            let acceptEmbed = new EmbedBuilder()
                .setColor(emb.color)
                .setTitle(`Waiting for ${opponent.tag} to accept!`)
                .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter(client.user.username, client.user.displayAvatarURL());

            let
                accept = new ButtonBuilder()
                    .setLabel("Accept")
                    .setStyle("SUCCESS")
                    .setCustomId("accepttt"),

                decline = new ButtonBuilder()
                    .setLabel("Decline")
                    .setStyle("DANGER")
                    .setCustomId("declinettt");

            let accep = new ActionRowBuilder().addComponents([
                accept,
                decline
            ]);

            // Notify opponent
            interaction.followUp({
                content: "Hey <@" + opponent.id + ">. You got a tictactoe request",
                embeds: [acceptEmbed],
                components: [accep]
            });

            // Setup collector
            let m = await interaction.fetchReply();
            const collector = m.createMessageComponentCollector({
                type: "BUTTON",
                time: 30000
            });

            // Run collector
            collector.on("collect", async (button) => {
                if (button.user.id !== opponent.id)
                    return button.reply({
                        content: "You are not the opponent mentioned.",
                        ephemeral: true
                    });

                // Check if challenge is accepted
                if (button.customId == "declinettt") {
                    button.deferUpdate();
                    return collector.stop("decline");
                } else if (button.customId == "accepttt") {
                    // Stop collector
                    collector.stop();
                    button.update({ components: [] })

                    // Setup board
                    let fighters = [interaction.user.id, opponent.id].sort(() =>
                        Math.random() > 0.5 ? 1 : -1
                    );

                    let
                        x_emoji = "❌",
                        o_emoji = "⭕",
                        dashmoji = "➖";

                    let Args = {
                        user: 0,
                        a1: {
                            style: "SECONDARY",
                            emoji: dashmoji,
                            disabled: false
                        },
                        a2: {
                            style: "SECONDARY",
                            emoji: dashmoji,
                            disabled: false
                        },
                        a3: {
                            style: "SECONDARY",
                            emoji: dashmoji,
                            disabled: false
                        },
                        b1: {
                            style: "SECONDARY",
                            emoji: dashmoji,
                            disabled: false
                        },
                        b2: {
                            style: "SECONDARY",
                            emoji: dashmoji,
                            disabled: false
                        },
                        b3: {
                            style: "SECONDARY",
                            emoji: dashmoji,
                            disabled: false
                        },
                        c1: {
                            style: "SECONDARY",
                            emoji: dashmoji,
                            disabled: false
                        },
                        c2: {
                            style: "SECONDARY",
                            emoji: dashmoji,
                            disabled: false
                        },
                        c3: {
                            style: "SECONDARY",
                            emoji: dashmoji,
                            disabled: false
                        }
                    };

                    // Send tutorial embed
                    const xoemb = new EmbedBuilder()
                        .setTitle("TicTacToe")
                        .setDescription(
                            `**How to Play?**\n*Wait for your turn.. If its your turn, Click one of the buttons from the table to draw your emoji.*`
                        )
                        .setColor(emb.color)
                        .setFooter(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();
                    let infomsg = interaction.editReply({ embeds: [xoemb] });

                    // Start the game
                    let msg = await interaction.channel.send({
                        content: `Waiting for Input | <@!${Args.userid}>, Your Emoji: ${o_emoji}`
                    });
                    tictactoe(msg);

                    async function tictactoe(m) {
                        Args.userid = fighters[Args.user];
                        let won = {
                            "<:O_:863314110560993340>": false,
                            "<:X_:863314044781723668>": false
                        };
                        if (
                            Args.a1.emoji == o_emoji &&
                            Args.b1.emoji == o_emoji &&
                            Args.c1.emoji == o_emoji
                        )
                            won["<:O_:863314110560993340>"] = true;
                        if (
                            Args.a2.emoji == o_emoji &&
                            Args.b2.emoji == o_emoji &&
                            Args.c2.emoji == o_emoji
                        )
                            won["<:O_:863314110560993340>"] = true;
                        if (
                            Args.a3.emoji == o_emoji &&
                            Args.b3.emoji == o_emoji &&
                            Args.c3.emoji == o_emoji
                        )
                            won["<:O_:863314110560993340>"] = true;
                        if (
                            Args.a1.emoji == o_emoji &&
                            Args.b2.emoji == o_emoji &&
                            Args.c3.emoji == o_emoji
                        )
                            won["<:O_:863314110560993340>"] = true;
                        if (
                            Args.a3.emoji == o_emoji &&
                            Args.b2.emoji == o_emoji &&
                            Args.c1.emoji == o_emoji
                        )
                            won["<:O_:863314110560993340>"] = true;
                        if (
                            Args.a1.emoji == o_emoji &&
                            Args.a2.emoji == o_emoji &&
                            Args.a3.emoji == o_emoji
                        )
                            won["<:O_:863314110560993340>"] = true;
                        if (
                            Args.b1.emoji == o_emoji &&
                            Args.b2.emoji == o_emoji &&
                            Args.b3.emoji == o_emoji
                        )
                            won["<:O_:863314110560993340>"] = true;
                        if (
                            Args.c1.emoji == o_emoji &&
                            Args.c2.emoji == o_emoji &&
                            Args.c3.emoji == o_emoji
                        )
                            won["<:O_:863314110560993340>"] = true;
                        if (won["<:O_:863314110560993340>"] != false) {
                            if (Args.user == 0)
                                return m.edit({
                                    content: `<@!${fighters[1]}> (${o_emoji}) won.. That was a nice game.`,
                                    components: []
                                });
                            else if (Args.user == 1)
                                return m.edit({
                                    content: `<@!${fighters[0]}> (${o_emoji}) won.. That was a nice game.`,
                                    components: []
                                });
                        }
                        if (
                            Args.a1.emoji == x_emoji &&
                            Args.b1.emoji == x_emoji &&
                            Args.c1.emoji == x_emoji
                        )
                            won["<:X_:863314044781723668>"] = true;
                        if (
                            Args.a2.emoji == x_emoji &&
                            Args.b2.emoji == x_emoji &&
                            Args.c2.emoji == x_emoji
                        )
                            won["<:X_:863314044781723668>"] = true;
                        if (
                            Args.a3.emoji == x_emoji &&
                            Args.b3.emoji == x_emoji &&
                            Args.c3.emoji == x_emoji
                        )
                            won["<:X_:863314044781723668>"] = true;
                        if (
                            Args.a1.emoji == x_emoji &&
                            Args.b2.emoji == x_emoji &&
                            Args.c3.emoji == x_emoji
                        )
                            won["<:X_:863314044781723668>"] = true;
                        if (
                            Args.a3.emoji == x_emoji &&
                            Args.b2.emoji == x_emoji &&
                            Args.c1.emoji == x_emoji
                        )
                            won["<:X_:863314044781723668>"] = true;
                        if (
                            Args.a1.emoji == x_emoji &&
                            Args.a2.emoji == x_emoji &&
                            Args.a3.emoji == x_emoji
                        )
                            won["<:X_:863314044781723668>"] = true;
                        if (
                            Args.b1.emoji == x_emoji &&
                            Args.b2.emoji == x_emoji &&
                            Args.b3.emoji == x_emoji
                        )
                            won["<:X_:863314044781723668>"] = true;
                        if (
                            Args.c1.emoji == x_emoji &&
                            Args.c2.emoji == x_emoji &&
                            Args.c3.emoji == x_emoji
                        )
                            won["<:X_:863314044781723668>"] = true;
                        if (won["<:X_:863314044781723668>"] != false) {
                            if (Args.user == 0)
                                return m.edit({
                                    content: `<@!${fighters[1]}> (${x_emoji}) won.. That was a nice game.`,
                                    components: []
                                });
                            else if (Args.user == 1)
                                return m.edit({
                                    content: `<@!${fighters[0]}> (${x_emoji}) won.. That was a nice game.`,
                                    components: []
                                });
                        }

                        let // Setup buttons
                            a1 = new ButtonBuilder()
                                .setStyle(Args.a1.style)
                                .setEmoji(Args.a1.emoji)
                                .setCustomId("a1")
                                .setDisabled(Args.a1.disabled),
                            a2 = new ButtonBuilder()
                                .setStyle(Args.a2.style)
                                .setEmoji(Args.a2.emoji)
                                .setCustomId("a2")
                                .setDisabled(Args.a2.disabled),
                            a3 = new ButtonBuilder()
                                .setStyle(Args.a3.style)
                                .setEmoji(Args.a3.emoji)
                                .setCustomId("a3")
                                .setDisabled(Args.a3.disabled),
                            b1 = new ButtonBuilder()
                                .setStyle(Args.b1.style)
                                .setEmoji(Args.b1.emoji)
                                .setCustomId("b1")
                                .setDisabled(Args.b1.disabled),
                            b2 = new ButtonBuilder()
                                .setStyle(Args.b2.style)
                                .setEmoji(Args.b2.emoji)
                                .setCustomId("b2")
                                .setDisabled(Args.b2.disabled),
                            b3 = new ButtonBuilder()
                                .setStyle(Args.b3.style)
                                .setEmoji(Args.b3.emoji)
                                .setCustomId("b3")
                                .setDisabled(Args.b3.disabled),
                            c1 = new ButtonBuilder()
                                .setStyle(Args.c1.style)
                                .setEmoji(Args.c1.emoji)
                                .setCustomId("c1")
                                .setDisabled(Args.c1.disabled),
                            c2 = new ButtonBuilder()
                                .setStyle(Args.c2.style)
                                .setEmoji(Args.c2.emoji)
                                .setCustomId("c2")
                                .setDisabled(Args.c2.disabled),
                            c3 = new ButtonBuilder()
                                .setStyle(Args.c3.style)
                                .setEmoji(Args.c3.emoji)
                                .setCustomId("c3")
                                .setDisabled(Args.c3.disabled);

                        let // Setup action rows
                            a = new ActionRowBuilder().addComponents([a1, a2, a3]),
                            b = new ActionRowBuilder().addComponents([b1, b2, b3]),
                            c = new ActionRowBuilder().addComponents([c1, c2, c3]);
                        let buttons = { components: [a, b, c] };

                        m.edit({
                            content: `Waiting for Input | <@!${Args.userid}> | Your Emoji: ${Args.user == 0 ? `${o_emoji}` : `${x_emoji}`}`,
                            components: [a, b, c]
                        });

                        // Create new collector for board
                        const collector = m.createMessageComponentCollector({
                            componentType: "BUTTON",
                            max: 1,
                            time: 30000
                        });

                        collector.on("collect", (b) => {
                            press(b)
                        });

                        // Handle button presses
                        function press(b) {
                            if (b.user.id !== Args.userid) {
                                b.followUp({
                                    content: "You cant play now",
                                    ephemeral: true
                                });
                                collector.on("collect", (b) => {
                                    press(b)
                                });
                            } else
                                if (Args.user == 0) {
                                    Args.user = 1;
                                    Args[b.customId] = {
                                        style: "SUCCESS",
                                        emoji: o_emoji,
                                        disabled: true
                                    };
                                } else {
                                    Args.user = 0;
                                    Args[b.customId] = {
                                        style: "DANGER",
                                        emoji: x_emoji,
                                        disabled: true
                                    };
                                }
                            b.deferUpdate();
                            const map = (obj, fun) =>
                                Object.entries(obj).reduce(
                                    (prev, [key, value]) => ({
                                        ...prev,
                                        [key]: fun(key, value)
                                    }),
                                    {}
                                );
                            const objectFilter = (obj, predicate) =>
                                Object.keys(obj)
                                    .filter((key) => predicate(obj[key]))
                                    .reduce((res, key) => ((res[key] = obj[key]), res), {});
                            let Brgs = objectFilter(
                                map(Args, (_, fruit) => fruit.emoji == dashmoji),
                                (num) => num == true
                            );
                            if (Object.keys(Brgs).length == 0)
                                return m.edit({ content: "It's a tie!", components: [] });
                            tictactoe(m);
                        }

                    }

                    // Handle click timeout
                    collector.on("end", (collected) => {
                        if (collected.size == 0)
                            m.edit({
                                content: `<@!${Args.userid}> didn\'t react in time! (30s)`,
                                components: []
                            });
                    });
                }
            });

            // Handle challenge decline and timeout
            collector.on("end", (collected, reason) => {
                if (reason == "time") {
                    let embed = new EmbedBuilder()
                        .setTitle("Challenge Not Accepted in Time")
                        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
                        .setColor(emb.errColor)
                        .setFooter(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
                        .setDescription("Ran out of time!\nTime limit: 30s");
                    m.edit({
                        embeds: [embed],
                        components: []
                    });
                }

                if (reason == "decline") {
                    let embed = new EmbedBuilder()
                        .setTitle("Game Declined!")
                        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
                        .setColor(emb.errColor)
                        .setFooter(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
                        .setDescription(`${opponent.user.tag} has declined your game!`);
                    m.edit({
                        embeds: [embed],
                        components: []
                    });
                }
            });
        }
    }
} catch (e) { toError(e, null, 0, false) }