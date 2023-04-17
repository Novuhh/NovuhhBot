const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const NoDependents = require('../../util/helper_no_dependents.js');
const Data = require('../../util/user_data.js');

const commandsPerPage = 10

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Information about the available commands.'),
	async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Help Menu')
            .setColor('Random')
        
        //console.log(interaction.client.messageCommands)

        // Get all commands aviable to the user
        const allCommands = await interaction.client.application.commands.fetch()
        const DMChannel = interaction.guild === null;

        // Slash commands
        const memberPerms = interaction.member.permissions.bitfield;
        let fields = [];
        for(command of allCommands.values())
        {
            // If dm but not allowed to dm
            if(DMChannel && command.permissions.dmPermission == false) { continue; }

            // If does not have permisions to send command
            let commandPerms = null
            if(command.permissions.manager.defaultMemberPermissions !== null)
            {
                commandPerms = command.permissions.manager.defaultMemberPermissions.bitfield;
            }
            else { commandPerms = 0n }
            if((memberPerms & commandPerms) != commandPerms) { continue; }

            // All commands aviable to user
            if(command.options.length == 0)
            {
                fields.push({name: `</${command.name}:${command.id}>`, value: command.description});
                continue;
            }
            
            for(option of command.options)
            {
                if(option.type == 1)
                {
                    fields.push({name: `</${command.name} ${option.name}:${command.id}>`, value: option.description});
                }
                else
                {
                    fields.push({name: `</${command.name}:${command.id}>`, value: command.description});
                    break;
                }
            }
            
        }

        // Message Commands
        let messageFields = []
        if(!DMChannel)
        {
            const prefix = new Data.GuildData(interaction.guild.id).GetPrefix();
            for(command of interaction.client.messageCommands.values())
            {
                switch(command.permission)
                {
                    case 0:
                        continue;
                    case 1:
                        break;
                    case 2:
                        if(NoDependents.IsAdmin(interaction.member))
                            break;
                        continue;
                    case 3:
                        if(interaction.user.id == interaction.guild.ownerId)
                            break;
                        continue;
                    case 4:
                        if(NoDependents.IsDevUser(interaction.user.id))
                            break;
                        continue;
                    default:
                        continue;
                }

                if(command.devGuildOnly == true && !NoDependents.IsDevGuild(interaction.guild.id)) { continue; }
                messageFields.push({name: `${prefix}${command.name}`, value: command.description})
            }
        }

        //console.log(messageFields)

        function updateEmbed(pageNum)
        {
            embed.setFooter({text: `Page ${pageNum} of ${Math.ceil(fields.length / commandsPerPage)}`})
                .setFields(fields.slice((pageNum-1) * commandsPerPage, Math.min(pageNum*commandsPerPage, fields.length)))
        }

        // Only one page
        if(fields.length <= commandsPerPage)
        {
            embed.setFields(fields)
            return interaction.reply({embeds: [embed]});
        }
        
        // Many pages
        let pageText = []
        for(let i = 1; i <= Math.ceil(fields.length / commandsPerPage); i++)
        {
            pageText.push({label: `Page: ${i}`, value: `slash ${i}`});
        }
        const menuHash = NoDependents.GenerateUserHash(interaction.user.id);
        const menu = new StringSelectMenuBuilder()
            .setPlaceholder("Change Page Number Here")
            .setCustomId(menuHash)
            .setOptions(pageText)
            .setMinValues(0)
            .setMaxValues(1)

        
        const filter = inter => inter.customId == menuHash;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 10 * 60 * 1000 });

        collector.on('collect', i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: `This select menu isn't for you!`, ephemeral: true });
            }
            i.deferUpdate();
            if(i.values[0].slice(0,5) == "slash")
            {
                updateEmbed(i.values[0].slice(5))
            }
            
            interaction.editReply({embeds: [embed]}).catch(console.error);
        });

        collector.on('end', () => {
            interaction.editReply({
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(menu.setDisabled(true))]
            }).catch(console.error);
        });
        
        updateEmbed(1)
        return interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(menu)]
        }).catch(console.error);
	},
};
