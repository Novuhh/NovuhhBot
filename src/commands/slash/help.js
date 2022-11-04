const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageSelectMenu, MessageActionRow, MessageEmbed, Message } = require('discord.js');
const NoDependents = require('../../util/helper_no_dependents.js');
const Data = require('../../util/user_data.js');
const { sizePillCost, sizeSurgeryCost, coinPerCred, minWaifuValue, maxWaifuValue } = require('../../data/constants.json');
const { main, mainAdmin, mainOwner, mainDev, size, misc, cred, waifu, coin, gamba, admin, owner, dev } = require('../../data/help_menu.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Information about the available commands.'),
	async execute(interaction) {
        const prefix = new Data.GuildData(interaction.guild.id).GetPrefix();

        const helpHash = NoDependents.GenerateRandomHash(32);
        const menuSelect = new MessageSelectMenu()
            .setCustomId(helpHash)
            .setPlaceholder('Subcommand help menu')
            .addOptions([
                {
                    label: 'Main',
                    description: 'The help menu for all commands',
                    value: 'main',
                },
                {
                    label: 'Miscellaneous',
                    description: 'The help menu for the miscellaneous commands',
                    value: 'misc',
                },
                {
                    label: 'Size',
                    description: 'The help menu for the size commands',
                    value: 'size',
                },
                {
                    label: 'Social Credit',
                    description: 'The help menu for the Social Credit commands',
                    value: 'cred',
                },
                {
                    label: 'Waifu',
                    description: 'The help menu for the Waifu commands',
                    value: 'waifu',
                },
                {
                    label: 'Coin',
                    description: 'The help menu for the Coin commands',
                    value: 'coin',
                },
                {
                    label: 'Gamba',
                    description: 'The help menu for Gambling commands',
                    value: 'gamba',
                }
            ])

        let mainOutput = main;

        // Add menu option if user is an admin
        if(NoDependents.IsAdmin(interaction.member))
        {
            mainOutput += mainAdmin;
            menuSelect.addOptions([{
                label: 'Admin',
                description: 'The help menu for the Admin commands',
                value: 'admin',
            }]);
        }

        // Add menu option if user is the guild owner
        if(interaction.guild.ownerId == interaction.user.id)
        {
            mainOutput += mainOwner;
            menuSelect.addOptions([{
                label: 'Owner',
                description: 'The help menu for the Server Owner commands',
                value: 'owner',
            }]);
        }

        // Add menu option if user is Nova
        if(NoDependents.IsDevUser(interaction.user.id))
        {
            mainOutput += mainDev;
            menuSelect.addOptions([{
                label: 'Developer',
                description: 'The help menu for the Developer commands',
                value: 'developer',
            }]);
        }
        const embed = new MessageEmbed()
            .setColor();
        mainOutput += '```';
        
        const row = new MessageActionRow()
            .addComponents(menuSelect);

        const filter = inter => inter.customId == helpHash;

        let lastMessage = mainOutput
        await interaction.reply({
            content: lastMessage,
            components: [row]
        });

        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 60 * 1000 });
        collector.on('collect', i => {
            if (i.user.id === interaction.user.id) {
                i.deferUpdate();
                collector.resetTimer();
                switch(i.values[0])
                {
                    case "main":
                    {
                        lastMessage = mainOutput;
                        return interaction.editReply({
                            content: lastMessage,
                            components: [row]
                        }).catch(console.error);
                    }
                    case "size":
                    {
                        lastMessage = size.replace(/\[prefix\]/g, '/').replace(/\[sizePill\]/g, sizePillCost).replace(/\[sizeSurgery\]/g, sizeSurgeryCost);
                        return interaction.editReply({
                            content: lastMessage,
                            components: [row]
                        }).catch(console.error);
                    }
                    case "misc":
                    {
                        lastMessage = misc.replace(/\[prefix\]/g, '/')
                        return interaction.editReply({
                            content: lastMessage,
                            components: [row]
                        }).catch(console.error);
                    }
                    case "cred":
                    {
                        lastMessage = cred.replace(/\[prefix\]/g, '/').replace(/\[coinPerCred\]/g, coinPerCred);
                        return interaction.editReply({
                            content: lastMessage,
                            components: [row]
                        }).catch(console.error);
                    }
                    case "waifu":
                    {
                        lastMessage = waifu.replace(/\[prefix\]/g, '/').replace(/\[waifuMin\]/g, minWaifuValue).replace(/\[waifuMax\]/g, maxWaifuValue);
                        return interaction.editReply({
                            content: lastMessage,
                            components: [row]
                        }).catch(console.error);
                    }
                    case "coin":
                    {
                        lastMessage = coin.replace(/\[prefix\]/g, '/').replace(/\[coinPerCred\]/g, coinPerCred);
                        return interaction.editReply({
                            content: lastMessage,
                            components: [row]
                        }).catch(console.error);
                    }
                    case "gamba":
                    {
                        lastMessage = gamba.replace(/\[prefix\]/g, '/')
                        return interaction.editReply({
                            content: lastMessage,
                            components: [row]
                        }).catch(console.error);
                    }
                    case "admin":
                    {
                        lastMessage = admin.replace(/\[prefix\]/g, '/')
                        return interaction.editReply({
                            content: lastMessage,
                            components: [row]
                        }).catch(console.error);
                    }
                    case "owner":
                    {
                        lastMessage = owner.replace(/\[prefix\]/g, prefix)
                        return interaction.editReply({
                            content: lastMessage,
                            components: [row]
                        }).catch(console.error);
                    }
                    case "developer":
                    {
                        lastMessage = dev.replace(/\[prefix\]/g, prefix)
                        return interaction.editReply({
                            content: lastMessage,
                            components: [row]
                        }).catch(console.error);
                    }
                }
            } else {
                i.reply({ content: `This select menu isn't for you!`, ephemeral: true });
            }
        });

        collector.on('end', () => {
            menuSelect.setDisabled(true);
            const disabledRow = new MessageActionRow()
                .addComponents(menuSelect);

            interaction.editReply({
                content: lastMessage,
                components: [disabledRow]
            }).catch(console.error);
        });

        return 
	},
};
