const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require("discord.js");
const ticketSchema = require("../../schemas/Ticket");

module.exports = {
    name: "ticket",
    description: "Configure ticket system",
    help: "/ticket setup [channel] [category] [logging_channel] [support_role] (description) | /ticket delete",
    cooldown: 2,
    permissions: ["MANAGE_CHANNELS"],
    allowedUIDs: [],
    options: [
        {
            name: "setup",
            description: "Setup the ticket system",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "Channel to setup ticket",
                    type: 7,
                    channelTypes: [0],
                    required: true
                },
                {
                    name: "category",
                    description: "Channel's category",
                    type: 7,
                    channelTypes: [4],
                    required: true
                },
                {
                    name: "logging",
                    description: "Channel to log tickets",
                    type: 7,
                    channelTypes: [0],
                    required: true
                },
                {
                    name: "support",
                    description: "Role for ticket support",
                    type: 8,
                    required: true
                },
                {
                    name: "description",
                    description: "Ticket's description",
                    type: 3,
                    required: false
                },
            ]
        },
        {
            name: "delete",
            description: "Deletes ticket configurtion",
            type: 1,
        }
    ],

    run: async (client, interaction) => {
        const ticketSystem = await ticketSchema.findOne({
            guildId: interaction.guild.id,
        });

        if (interaction.options.getSubcommand() === "setup") {
            const channel = interaction.options.getChannel("channel");
            const category = interaction.options.getChannel("category");
            const ticketlog = interaction.options.getChannel("logging");
            const supportRole = interaction.options.getRole("support");
            const description = interaction.options.getString("description") || "Click the `Create Ticket` button below to create a ticket and out support team will be right with you!";

            if (ticketSystem) {
                ticketSystem.categoryId = category.id;
                ticketSystem.channelId = channel.id;

                ticketSystem.save().catch((err) => {
                    console.log(err);
                });
            } else {
                new ticketSchema({
                    guildId: interaction.guild.id,
                    categoryId: category.id,
                    channelId: channel.id,
                    ticketlog: ticketlog.id,
                    supportRole: supportRole.id,
                }).save();
            }

            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Create a ticket!")
                        .setDescription(description)
                        .setColor("Blurple"),
                ],
                components: [
                    new ActionRowBuilder().setComponents(
                        new ButtonBuilder()
                            .setCustomId("createTicket")
                            .setLabel("Create Ticket!")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("<:ticketbadge:1010601796374364171>")
                    ),
                ],
            });

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Ticket System Setup")
                        .setDescription("Ticket setup complete!")
                        .addFields(
                            {
                                name: "Channel",
                                value: `<#${channel.id}>`,
                                inline: true,
                            },
                            {
                                name: "Category",
                                value: `${category.name}`,
                                inline: true,
                            }
                        )
                        .setColor("Green"),
                ],
                ephemeral: true
            });
        }
        if (interaction.options.getSubcommand() === "delete") {
            const ticketConfig = await ticketSchema.findOne({
                guildId: interaction.guild.id,
            });
            if (!ticketConfig) {
                const NotCreatedSystem = new EmbedBuilder()
                    .setDescription(
                        "You have not created a ticket system yet! To create one run `/tickets setup`."
                    )
                    .setColor("Red");
                interaction.reply({ embeds: [NotCreatedSystem] });
            } else {
                await ticketSchema.findOneAndDelete({ guildId: interaction.guild.id });

                const CreatedSystem = new EmbedBuilder()
                    .setDescription("Ticket system successfully deleted!")
                    .setColor("Red");
                interaction.reply({ embeds: [CreatedSystem] });
            }
        }
    },
};