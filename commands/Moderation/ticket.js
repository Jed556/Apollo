const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require("discord.js");
const ticketSchema = require("../../schemas/Ticket");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Configure the ticket system")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName("setup")
            .setDescription("Setup the ticket system")
            .addChannelOption(option => option
                .setName("channel")
                .setDescription("Channel to setup ticket")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
            .addChannelOption(option => option
                .setName("category")
                .setDescription("Channel's category")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)
            )
            .addChannelOption(option => option
                .setName("logging")
                .setDescription("Logs a ticket after its been closed")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
            .addRoleOption(option => option
                .setName("support")
                .setDescription("The role to assign to support tickets.")
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("description")
                .setDescription("Ticket's description")
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("delete")
            .setDescription("Deletes ticket configurtion")
        ),
    help: "/ticket setup [channel] [category] [logging] [support] (description) | /ticket delete",
    cooldown: 2,
    allowedUIDs: [],

    run: async (client, interaction) => {
        const ticketSystem = await ticketSchema.findOne({
            guildId: interaction.guild.id,
        });

        if (interaction.options.getSubcommand() === "setup") {
            const channel = interaction.options.getChannel("channel");
            const category = interaction.options.getChannel("category");
            const ticketlog = interaction.options.getChannel("logging");
            const supportRole = interaction.options.getRole("support");
            const description = interaction.options.getString("description") || "Click the `Create Ticket` button below to create a ticket.";

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