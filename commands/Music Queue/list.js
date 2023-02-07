const
    { EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js'),
    { distubeValidate } = require('../../system/distubeFunctions'),
    { toError } = require('../../system/functions'),
    emb = require('../../config/embed.json');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("list-queue")
            .setDescription("Lists the current music queue")
            .setDefaultMemberPermissions()
            .setDMPermission(false),
        help: "/list-queue",
        cooldown: 5,
        allowedUIDs: [],
        category: "music",

        run: async (client, interaction) => {
            const
                { member, guildId } = interaction,
                { guild } = member;
            let newQueue = client.distube.getQueue(guildId);

            const validate = await distubeValidate(interaction, newQueue, ["channel", "userLimit", "playing"]);
            if (validate) return;

            let embeds = [],
                k = 10,
                theSongs = newQueue.songs;

            // Defining each page
            for (let i = 0; i < theSongs.length; i += 10) {
                let qus = theSongs;
                const current = qus.slice(i, k);
                let j = i;
                const info = current.map((track) => `**${j++} -** [\`${String(track.name).replace(/\[/igu, "{").replace(/\]/igu, "}").substr(0, 60)}\`](${track.url}) - \`${track.formattedDuration}\``).join("\n");
                const embed = new EmbedBuilder()
                    .setColor(emb.color)
                    .setDescription(`${info}`);
                if (i < 10) {
                    embed.setAuthor({ name: `TOP ${theSongs.length > 50 ? 50 : theSongs.length} | QUEUE OF ${guild.name}`, iconURL: emb.disc.list });
                    embed.setDescription(`**(0) Current Song:**\n> [\`${theSongs[0].name.replace(/\[/igu, "{").replace(/\]/igu, "}")}\`](${theSongs[0].url})\n\n${info}`);
                }
                embeds.push(embed);
                k += 10; //Raise k to 10
            }
            embeds[embeds.length - 1] = embeds[embeds.length - 1]
                .setFooter({ text: client.user.username + `\n${theSongs.length} Song${theSongs.length != 1 ? "s" : ""} in Queue | Duration: ${newQueue.formattedDuration}`, iconURL: client.user.displayAvatarURL() })

            let pages = [];
            for (let i = 0; i < embeds.length; i += 3) {
                pages.push(embeds.slice(i, i + 3));
            }
            pages = pages.slice(0, 24);
            const Menu = new StringSelectMenuBuilder()
                .setCustomId("QUEUEPAGES")
                .setPlaceholder("Select Page")
                .addOptions(
                    pages.map((page, index) => {
                        let Obj = {};
                        Obj.label = `Page ${index}`
                        Obj.value = `${index}`;
                        Obj.description = `Shows the ${index}/${pages.length - 1} Page`
                        return Obj;
                    })
                );
            const row = new ActionRowBuilder().addComponents([Menu])
            interaction.reply({
                embeds: [embeds[0]],
                components: [row],
                ephemeral: true
            });

            //Event
            client.on('interactionCreate', (i) => {
                if (!i.isStringSelectMenu()) return;
                if (i.customId === "QUEUEPAGES" && i.applicationId == client.user.id) {
                    i.reply({
                        embeds: pages[Number(i.values[0])],
                        ephemeral: true
                    }).catch(e => { })
                }
            });
        }
    }
} catch (e) { toError(e, null, 0, false) }