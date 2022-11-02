const
    { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js'),
    { createTranscript } = require('discord-html-transcripts'),
    ticketSchema = require('../../schemas/Ticket'),
    emb = require('../../config/embed.json');

module.exports = {
    name: "interactionCreate",
    on: true,

    run: async (client, interaction) => {
        if (!interaction.isButton()) return;

        const ID = Math.floor(Math.random() * 90000);

        const config = await ticketSchema.findOne({
            guildID: interaction.guild.id,
        });

        // Check if the user clicked the "create ticket" button
        if (interaction.customId == "createTicket") {
            await interaction.deferReply({
                content: "Creating your ticket...",
                ephemeral: true,
            });

            // Check if config config exists
            if (!config) {
                const Reply = new EmbedBuilder()
                    .setTitle("Ticket System")
                    .setDescription(
                        `You are required to set up the ticket system before using it! Please use \`/ticket setup\` to set it !up`
                    )
                    .setColor(colors.red);

                await interaction.reply({
                    embeds: [Reply],
                    ephemeral: true,
                });
                return;
            }

            const category = interaction.guild.channels.cache.get(config.categoryId);

            const {
                SendMessages,
                ViewChannel,
                AddReactions,
                AttachFiles,
                EmbedLinks,
                ReadMessageHistory
            } = PermissionFlagsBits;

            // Create the ticket channel
            const channel = await category.children.create({
                name: `ticket-${interaction.user.username}${interaction.user.discriminator}`,
                type: ChannelType.GuildText,
                topic: interaction.user.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [ViewChannel], // View channel
                    },
                    {
                        id: config.supportRole,
                        allow: [
                            SendMessages,
                            ViewChannel,
                            AddReactions,
                            AttachFiles,
                            EmbedLinks,
                            ReadMessageHistory,
                        ],
                    },
                    {
                        id: interaction.member.user.id,
                        allow: [SendMessages, ViewChannel, AddReactions, AttachFiles],
                    },
                ],
            });

            // Send "ticket created" message
            const TicketActions = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("ticket-close")
                    .setLabel("Close Ticket")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setCustomId("ticket-claim")
                    .setLabel("Claim Ticket")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(false)
            );

            const StartEmbed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.avatarURL(),
                })
                .setTitle(`Ticket-${interaction.user.username}#${interaction.user.discriminator}`)
                .setDescription(`Welcome **${interaction.user.username}** to this ticket!\nPlease wait for a staff member to reply to your ticket, or if you created it by accidentally please use the "close ticket" button to close it.`)
                .setColor("Blurple");

            channel.send({
                embeds: [StartEmbed],
                components: [TicketActions],
            });

            const Reply = new EmbedBuilder()
                .setDescription(`Your ticket has been successfully created!`)
                .setColor("Green");

            await interaction.followUp({
                embeds: [Reply],
                ephemeral: true,
            });
        }

        // Check if user clicked "close ticket" button
        else if (interaction.customId == "ticket-close") {
            if (!interaction.member.roles.cache.has(config.supportRole))
                return interaction.reply({
                    content: `<@${interaction.user.id}> You require the support role to claim a ticket.`,
                    ephemeral: true,
                });

            const { channel } = interaction;

            // Buttons
            const DisabledClose = new ActionRowBuilder().setComponents(
                new ButtonBuilder()
                    .setCustomId("ticket-close")
                    .setLabel("Close Ticket")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
            );

            // Some Embeds
            const reply = new EmbedBuilder()
                .setDescription(`The ticket has been closed by **${interaction.user.tag}**`)
                .setColor("Red");

            const Embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`The ticket is closing please wait 10 seconds until it gets deleted.`);

            const EmbedDM = new EmbedBuilder()
                .setTitle(`Ticket Closed!`)
                .setColor("Red")
                .setFields({
                    name: `Information:`,
                    value: `
                    **Guild Name:** ${interaction.guild.name}
                    **Guild Id:** ${interaction.guild.id}
                    **Created By:** <@!${channel.topic}>
                    **Ticket ID:** ${ID}
                    **Closed By:** ${interaction.user.tag}
                    `,
                })
                .setFooter({ text: "The ticket was closed at" })
                .setTimestamp();

            const attachment = await createTranscript(channel, {
                limit: -1,
                returnBuffer: false,
                fileName: `Ticket-${ID}.html`,
            });

            interaction.message.edit({
                embeds: [Embed],
                components: [DisabledClose],
            });

            await interaction.reply({
                embeds: [reply],
                ephemeral: false,
            });

            setTimeout(() => {
                client.channels.cache.get(config.ticketlog).send({
                    embeds: [EmbedDM],
                    files: [attachment],
                });
            }, 10000);

            setTimeout(() => {
                interaction.channel.delete();
            }, 10000);
        }

        // Checks if a user clicked ticket claim
        else if (interaction.customId == "ticket-claim") {
            if (!interaction.member.roles.cache.has(config.supportRole))
                return interaction.reply({
                    content: `<@${interaction.user.id}> You require the support role to claim a ticket.`,
                    ephemeral: true,
                });
            const DisabledClaim = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("ticket-close")
                    .setLabel("Close Ticket")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(false),
                new ButtonBuilder()
                    .setCustomId("ticket-claim")
                    .setLabel("Claim Ticket")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true)
            );

            const Embed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.avatarURL(),
                })
                .setTitle(`Ticket-${interaction.user.username}#${interaction.user.discriminator}`)
                .setDescription(
                    `Welcome **${interaction.user.username}** to this ticket!\nPlease wait for a staff member to reply to your ticket, or if you created it by accidentally please use the "close ticket" button to close it.`
                )
                .setColor(emb.color);

            interaction.message.edit({
                embeds: [Embed],
                components: [DisabledClaim],
            });

            const reply = new EmbedBuilder()
                .setDescription(
                    `Ticket has been claimed by **${interaction.user.tag}**!`
                )
                .setColor("Green");

            await interaction.reply({
                embeds: [reply],
                ephemeral: false,
            });
        }
    }
}