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
                guildId: guildID,
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

                const category = guild.channels.cache.get(config.categoryId);

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
                    name: `ticket-${user.username}${user.discriminator}`,
                    type: ChannelType.GuildText,
                    topic: user.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
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
                            id: member.user.id,
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
                        name: user.tag,
                        iconURL: user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle(`Ticket-${user.tag}`)
                    .setDescription(
                        `Welcome <@${user.id}> to this ticket!\nPlease wait for a staff member to reply to your ticket, or if you created it accidentally please use the "close ticket" button to close it.`
                    )
                    .setColor(emb.color);

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
                if (!member.roles.cache.has(config.supportRole))
                    return interaction.reply({
                        content: `<@${user.id}> You require the support role to claim a ticket.`,
                        ephemeral: true,
                    });

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
                    .setDescription(`The ticket has been closed by <@${user.id}>[**#${user.discriminator}**](https://discord.com/users/${user.id})\nPlease wait 10 seconds until it gets deleted.`)
                    .setColor("Red");

                const EmbedDM = new EmbedBuilder()
                    .setTitle(`Ticket Closed!`)
                    .setColor("Red")
                    .setFields({
                        name: `Information:`,
                        value: `
                    **Guild Name:** ${guild.name}
                    **Guild Id:** ${guildId}
                    **Created By:** <@!${channel.topic}>[**#${user.discriminator}**](https://discord.com/users/${user.id})
                    **Ticket ID:** ${ID}
                    **Closed By:** <@${user.id}>[**#${user.discriminator}**](https://discord.com/users/${user.id})
                    `,
                    })
                    .setFooter({ text: "The ticket was closed at" })
                    .setTimestamp();

                await message.delete();

                // Old message edit
                // message.edit({
                //     embeds: [Embed],
                //     components: [DisabledClose],
                // });

                const attachment = await createTranscript(channel, {
                    limit: -1,
                    returnBuffer: false,
                    filename: `Ticket-${ID}.html`,
                    saveImages: true,
                    footerText: "Exported {number} message{s}",
                    poweredBy: false
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
                    channel.delete();
                }, 10000);
            }

            // Checks if a user clicked ticket claim
            else if (interaction.customId == "ticket-claim") {
                if (!member.roles.cache.has(config.supportRole))
                    return interaction.reply({
                        content: `<@${user.id}> You require the support role to claim a ticket.`,
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
                        name: user.tag,
                        iconURL: user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle(`Ticket-${user.tag}`)
                    .setDescription(
                        `Welcome <@${user.id}> to this ticket!\nIf you created it accidentally please use the "close ticket" button to close it.`
                    )
                    .setColor(emb.color);

                message.edit({
                    embeds: [Embed],
                    components: [DisabledClaim],
                });

                const reply = new EmbedBuilder()
                    .setDescription(`Ticket has been claimed by <@${user.id}>[**#${user.discriminator}**](https://discord.com/users/${user.id})!`)
                    .setColor("Green");

                await interaction.reply({
                    embeds: [reply],
                    ephemeral: false,
                });
            }
        } catch (e) {
            eventErrorSend(client, interaction, e, true, true);
        }
    }
}