const
    { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js"),
    { toError } = require('../../system/functions'),
    emb = require("../../config/embed.json");

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("rps")
            .setDescription("Play rock paper scissors with someone")
            .setDefaultMemberPermissions()
            .setDMPermission(false)
            .addUserOption(option => option
                .setName("opponent")
                .setDescription("Pick your opponent")
                .setRequired(true)
            ),
        help: "/rps [opponent]",
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
                .setTitle(`Waiting for ${opponent.tag} to accept!`)
                .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
                .setColor(emb.color)
                .setFooter(client.user.username, client.user.displayAvatarURL());

            let accept = new ButtonBuilder()
                .setLabel("Accept")
                .setStyle("SUCCESS")
                .setCustomId("accept"),

                decline = new ButtonBuilder()
                    .setLabel("Decline")
                    .setStyle("DANGER")
                    .setCustomId("decline");

            let accep = new ActionRowBuilder().addComponents([
                accept,
                decline
            ]);

            // Notify opponent
            interaction.followUp({
                content: `Hey <@${opponent.id}>. You got a RPS invite`,
                embeds: [acceptEmbed],
                components: [accep]
            });
            let m = await interaction.fetchReply();

            // Setup collector
            const collector = m.createMessageComponentCollector({
                type: "BUTTON",
                time: 30000
            });

            // Run collector
            collector.on("collect", (button) => {
                if (button.user.id !== opponent.id)
                    return button.reply({
                        content: "You are not the opponent mentioned.",
                        ephemeral: true
                    });

                // Check if challenge is accepted
                if (button.customId == "decline") {
                    button.deferUpdate();
                    return collector.stop("decline");
                }

                // Setup game
                button.deferUpdate();
                let embed = new EmbedBuilder()
                    .setTitle(`${interaction.user.tag} VS. ${opponent.tag}`)
                    .setColor(emb.color)
                    .setFooter(client.user.username, client.user.displayAvatarURL())
                    .setDescription("Select 🪨, 📄, or ✂️");

                let // Setup buttons
                    rock = new ButtonBuilder()
                        .setLabel("ROCK")
                        .setCustomId("rock")
                        .setStyle("SECONDARY")
                        .setEmoji("🪨"),

                    paper = new ButtonBuilder()
                        .setLabel("PAPER")
                        .setCustomId("paper")
                        .setStyle("SECONDARY")
                        .setEmoji("📄"),

                    scissors = new ButtonBuilder()
                        .setLabel("SCISSORS")
                        .setCustomId("scissors")
                        .setStyle("SECONDARY")
                        .setEmoji("✂️");

                let row = new ActionRowBuilder().addComponents([
                    rock,
                    paper,
                    scissors
                ]);

                interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });

                collector.stop();
                let ids = new Set();
                ids.add(interaction.user.id);
                ids.add(opponent.id);
                let op, auth;

                const collect = m.createMessageComponentCollector({
                    type: "BUTTON",
                    time: 30000
                });

                collect.on("collect", (b) => {
                    // Check if user is opponent
                    if (!ids.has(b.user.id))
                        return button.reply({
                            content: "You are not the opponent mentioned.",
                            ephemeral: true
                        });
                    ids.delete(b.user.id);
                    b.deferUpdate();
                    if (b.user.id == opponent.id) {
                        mem = b.customId;
                    }
                    if (b.user.id == interaction.user.id) {
                        auth = b.customId;
                    }
                    if (ids.size == 0) collect.stop();
                });

                collect.on("end", (c, reason) => {
                    // Handle move timeout
                    if (reason == "time") {
                        let embed = new EmbedBuilder()
                            .setTitle("Game Timed Out!")
                            .setColor(emb.errColor)
                            .setDescription(
                                "One or more players did not make a move in time(30s)"
                            )
                            .setFooter(client.user.username, client.user.displayAvatarURL());
                        interaction.editReply({
                            embeds: [embed],
                            components: []
                        });
                    } else {
                        // Handle game moves
                        if (mem == "rock" && auth == "scissors") {
                            let embed = new EmbedBuilder()
                                .setTitle(`${opponent.tag} Wins!`)
                                .setColor(emb.okColor)
                                .setDescription("Rock defeats Scissors")
                                .setFooter(client.user.username, client.user.displayAvatarURL());
                            interaction.editReply({ embeds: [embed], components: [] });
                        } else if (mem == "scissors" && auth == "rock") {
                            let embed = new EmbedBuilder()
                                .setTitle(`${interaction.user.tag} Wins!`)
                                .setColor(emb.okColor)
                                .setDescription("Rock defeats Scissors")
                                .setFooter(client.user.username, client.user.displayAvatarURL());
                            interaction.editReply({ embeds: [embed], components: [] });
                        } else if (mem == "scissors" && auth == "paper") {
                            let embed = new EmbedBuilder()
                                .setTitle(`${opponent.tag} Wins!`)
                                .setColor(emb.okColor)
                                .setDescription("Scissors defeats Paper")
                                .setFooter(client.user.username, client.user.displayAvatarURL());
                            interaction.editReply({ embeds: [embed], components: [] });
                        } else if (mem == "paper" && auth == "scissors") {
                            let embed = new EmbedBuilder()
                                .setTitle(`${interaction.user.tag} Wins!`)
                                .setColor(emb.okColor)
                                .setDescription("Scissors defeats Paper")
                                .setFooter(client.user.username, client.user.displayAvatarURL());
                            interaction.editReply({ embeds: [embed], components: [] });
                        } else if (mem == "paper" && auth == "rock") {
                            let embed = new EmbedBuilder()
                                .setTitle(`${opponent.tag} Wins!`)
                                .setColor(emb.okColor)
                                .setDescription("Paper defeats Rock")
                                .setFooter(client.user.username, client.user.displayAvatarURL());
                            interaction.editReply({ embeds: [embed], components: [] });
                        } else if (mem == "rock" && auth == "paper") {
                            let embed = new EmbedBuilder()
                                .setTitle(`${interaction.user.tag} Wins!`)
                                .setColor(emb.okColor)
                                .setDescription("Paper defeats Rock")
                                .setFooter(client.user.username, client.user.displayAvatarURL());
                            interaction.editReply({ embeds: [embed], components: [] });
                        } else {
                            let embed = new EmbedBuilder()
                                .setTitle("Draw!")
                                .setColor(emb.okColor)
                                .setDescription(`Both players chose ${mem}`)
                                .setFooter(client.user.username, client.user.displayAvatarURL());
                            interaction.editReply({ embeds: [embed], components: [] });
                        }
                    }
                });
            });

            // Handle challenge decline and timeout
            collector.on("end", (collected, reason) => {
                if (reason == "time") {
                    let embed = new EmbedBuilder()
                        .setTitle("Challenge Not Accepted in Time")
                        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
                        .setColor(emb.errColor)
                        .setFooter(client.user.username, client.user.displayAvatarURL())
                        .setDescription("Ran out of time!\nTime limit: 30s");
                    interaction.editReply({
                        embeds: [embed],
                        components: []
                    });
                }
                if (reason == "decline") {
                    let embed = new EmbedBuilder()
                        .setTitle("Game Declined!")
                        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
                        .setColor(emb.errColor)
                        .setFooter(client.user.username, client.user.displayAvatarURL())
                        .setDescription(`${opponent.tag} has declined your game!`);
                    interaction.editReply({
                        embeds: [embed],
                        components: []
                    });
                }
            });

        }
    }
} catch (e) { toError(e) }