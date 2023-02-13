const
    { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js'),
    { createTranscript } = require('discord-html-transcripts'),
    { eventErrorSend, randomNum } = require('../../system/functions'),
    ticketSchema = require('../../schemas/Ticket'),
    emb = require('../../config/embed.json');

module.exports = {
    name: "interactionCreate",
    on: true,

    run: async (client, interaction) => {
        try {
            if (!interaction.isButton()) return;
            const { member, user, guild, guildId, channel, channelId, message } = interaction;

            const ID = randomNum(0, 999999) // old: Math.floor(Math.random() * 90000);

            const config = await ticketSchema.findOne({
                guildId: guildId,
            });

            // Base ticket channel embed
            const Embed = new EmbedBuilder()
                .setAuthor({
                    name: user.tag,
                    iconURL: user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle(`Ticket-${user.tag}`)
                .setDescription(`Welcome <@${user.id}> to this ticket!\nIf you created it accidentally please use the "close ticket" button to close it.`)
                .setColor(emb.color);

            // Check if the user clicked the "create ticket" button
            if (interaction.customId == "createTicket") {
                await interaction.deferReply({
                    content: "Creating your ticket...",
                    ephemeral: true,
                });

                // Check if config exists
                if (!config) {
                    await interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setTitle("Ticket System")
                            .setDescription(
                                "You are required to set up the ticket system before using it! Please use `/ticket setup` to set it up"
                            )
                            .setColor(colors.red)],
                        ephemeral: true,
                    });
                    return;
                }

                // Create ticket channel
                const category = guild.channels.cache.get(config.categoryId);

                const {
                    SendMessages,
                    ViewChannel,
                    AddReactions,
                    AttachFiles,
                    EmbedLinks,
                    ReadMessageHistory
                } = PermissionFlagsBits;

                const channel = await category.children.create({
                    name: `ticket-${user.username}${user.discriminator}`,
                    type: ChannelType.GuildText,
                    topic: user.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [ViewChannel], // Private channel
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
                            id: member.user.id,
                            allow: [SendMessages, ViewChannel, AddReactions, AttachFiles],
                        },
                    ],
                });

                // Ticket system buttons
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

                // Embed updates and replies
                channel.send({
                    embeds: [Embed.setDescription(
                        `Welcome <@${user.id}> to this ticket!\nPlease wait for a staff member to reply to your ticket, or if you created it accidentally please use the "close ticket" button to close it.`
                    )],
                    components: [TicketActions],
                });

                await interaction.followUp({
                    embeds: [new EmbedBuilder()
                        .setDescription("Your ticket has been successfully created!")
                        .setColor(emb.okColor)],
                    ephemeral: true,
                });
            }

            // Check if user clicked "close ticket" button
            else if (interaction.customId == "ticket-close") {
                if (!member.roles.cache.has(config.supportRole))
                    return interaction.reply({
                        content: `<@${user.id}> You require the support role to claim a ticket.`,
                        ephemeral: true,
                    });

                // Disable close button
                const DisabledClose = new ActionRowBuilder().setComponents(
                    new ButtonBuilder()
                        .setCustomId("ticket-close")
                        .setLabel("Close Ticket")
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );

                // Adjust initial embeds before logging
                await message.delete();

                // Old message edit
                // message.edit({
                //     embeds: [Embed],
                //     components: [DisabledClose],
                // });

                // Attach transcript
                const attachment = await createTranscript(channel, {
                    limit: -1,
                    returnBuffer: false,
                    filename: `Ticket-${ID}.html`,
                    saveImages: true,
                    footerText: "Exported {number} message{s}",
                    poweredBy: false
                });

                // Embed updates and replies
                await channel.send({
                    embeds: [new EmbedBuilder()
                        .setDescription(`The ticket has been closed by <@${user.id}>[**#${user.discriminator}**](https://discord.com/users/${user.id})\nPlease wait 10 seconds until it gets deleted.`)
                        .setColor(emb.errColor)],
                    ephemeral: false,
                });

                setTimeout(() => {
                    client.channels.cache.get(config.ticketlog).send({
                        embeds: [new EmbedBuilder()
                            .setTitle(`Ticket Closed!`)
                            .setColor(emb.errColor)
                            .setFields({
                                name: `Information:`,
                                value: `
                            **Guild Name:** ${guild.name}
                            **Guild ID:** ||${guildId}||
                            **Created By:** <@!${channel.topic}>[**#${user.discriminator}**](https://discord.com/users/${user.id})
                            **Ticket ID:** ${ID}
                            **Closed By:** <@${user.id}>[**#${user.discriminator}**](https://discord.com/users/${user.id})
                            `,
                            })
                            .setTimestamp()],
                        files: [attachment]
                    });

                    // Delete ticket channel
                    channel.delete();
                }, 10000);
            }

            // Checks if a user clicked ticket claim
            else if (interaction.customId == "ticket-claim") {
                interaction.deferUpdate();

                if (!member.roles.cache.has(config.supportRole))
                    return interaction.reply({
                        content: `<@${user.id}> You require the support role to claim a ticket.`,
                        ephemeral: true,
                    });

                // Disable claim button
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

                // Embed updates and replies
                message.edit({
                    embeds: [Embed],
                    components: [DisabledClaim],
                });

                channel.send({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Ticket has been claimed by <@${user.id}>[**#${user.discriminator}**](https://discord.com/users/${user.id})!`)
                        .setColor(emb.okColor)],
                    ephemeral: false,
                }).then(reply => {
                    setTimeout(() => {
                        reply.delete();
                    }, 10000);
                })
            }
        } catch (e) {
            eventErrorSend(client, interaction, e, true, true);
        }
    }
}