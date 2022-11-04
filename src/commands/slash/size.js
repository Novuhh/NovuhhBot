const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Data = require("../../util/user_data.js")
const { sizePillCost, sizeSurgeryCost, sizePillSuccessChance } = require('../../data/constants.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('size')
		.setDescription('Get the size of yourself or someone else')
        .addSubcommand(subcommand => subcommand
            .setName('view')
            .setDescription('Show the size of a user')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user\'s size to show')
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('pill')
            .setDescription(`Take a pill for a chance to increase or decrease your size, cost ${sizePillCost} coin per pill.`)
            .addStringOption(option => option
                .setName(`pill`)
                .setDescription(`Are you going take testosterone or estogen?`)
                .setRequired(true)
                .addChoices([
                    ['Testosterone','cock'],
                    ['Estrogen','pussy']
                ])
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('surgery')
            .setDescription(`They did surgery on a grape! Change that 6 inch cock to a 6 inch pussy for ${sizeSurgeryCost} coin.`)
        ),
	async execute(interaction) {
        const guildSize = new Data.Size(interaction.guildId);
        const embed = new MessageEmbed();
        embed.setColor('RANDOM');

        const subCommand = interaction.options.getSubcommand();
        switch(subCommand)
        {
            case "view":
            {
                // Use targeted user if 
                let user = interaction.options.getUser('user');
                if(!user) 
                    user = interaction.user;

                // The user does not have a size
                if(!guildSize.CheckIfUserHasSize(user.id))
                {
                    if(user == interaction.user)
                    {
                        guildSize.SetSizeOfUser(user.id);
                    }
                    else
                    {
                        embed.setTitle('Why you checking out someone else?').setDescription(`I don't know ${user}'s size. They must do /size view first.`);
                        return interaction.reply({embeds: [embed]});
                    }
                }

                const currentSize = guildSize.GetSizeOfUser(user.id);

                var length = '';
                for(i = 0; i < Math.abs(currentSize); i++){length += '=';}
                // Cock
                if(currentSize >= 0)
                {
                    embed.setDescription(`${user} has a \`${currentSize}\` inch long cock.\n8${length}D\nLook at it in all of its glory.`);
                    return interaction.reply({embeds: [embed]});
                }
                // Pussy
                else
                {
                    length = length.slice(0, length.length - 1)
                    embed.setDescription(`${user} has a \`${Math.abs(currentSize) - 1}\` inch deep pussy.\n<${length}O\nLook at it in all of its glory.`);
                    return interaction.reply({embeds: [embed]});
                }
            }
            
            case "pill":
            {
                const user = interaction.user;
                // The user does not have a size
                if(!guildSize.CheckIfUserHasSize(user.id))
                {
                    embed.setDescription(`How big are you?. Do /size first.`);
                    return interaction.reply({embeds: [embed]});
                }

                // User does not have coin
                const coinOfUser = Data.Coin.GetCoinOfUser(user.id);
                if(coinOfUser < sizePillCost)
                {
                    embed.setDescription(`A pill cost \`${sizePillCost}\` coin. You only have \`${coinOfUser}\` coin.`);
                    return interaction.reply({embeds: [embed]});
                }

                const userChoice = interaction.options.getString(`pill`);
                const userSize = guildSize.GetSizeOfUser(user.id);
                // Already max size?
                if(userSize >= 12 && userChoice == 'cock')
                {
                    embed.setDescription(`You already got the biggest dick you can reasonably have.`);
                    return interaction.reply({embeds: [embed]});
                }
                if(-13 >= userSize && userChoice == 'pussy')
                {
                    embed.setDescription(`You already got the deepest pussy you can reasonably have.`);
                    return interaction.reply({embeds: [embed]});
                }

                Data.Coin.ChangeCoinOfUserByAmount(user.id, -sizePillCost);
                // Does pill work?
                if(Math.random() <= sizePillSuccessChance)
                {
                    if(userChoice == 'cock')
                    {
                        guildSize.ChangeSizeOfUser(user.id, 1);
                        if(userSize == -1)
                        {
                            embed.setDescription(`Your pussy just became a dick. Micro but still a dick.`);
                            return interaction.reply({embeds: [embed]});
                        }
                        if(userSize >= 0)
                        {
                            embed.setDescription(`You cock just grew an inch longer.`);
                            return interaction.reply({embeds: [embed]});
                        }
                        embed.setDescription(`Your pussy just shrank an inch shorter.`);
                        return interaction.reply({embeds: [embed]});
                    }

                    if(userChoice == 'pussy')
                    {
                        guildSize.ChangeSizeOfUser(user.id, -1);
                        if(userSize == 0)
                        {
                            embed.setDescription(`Your micro dick just became a pussy. Small but still a pussy.`);
                            return interaction.reply({embeds: [embed]});
                        }
                        if(userSize < 0)
                        {
                            embed.setDescription(`You pussy just got an inch deeper.`);
                            return interaction.reply({embeds: [embed]});
                        }
                        embed.setDescription(`Your cock just shrank an inch shorter.`);
                        return interaction.reply({embeds: [embed]});
                    }
                }
                embed.setDescription(`The pill didn't seem to have any effet. Try another and up the dosage?`);
                return interaction.reply({embeds: [embed]});
            }

            case "surgery":
            {
                const user = interaction.user;
                // The user does not have a size
                if(!guildSize.CheckIfUserHasSize(user.id))
                {
                    embed.setDescription(`Let me see what you've got first. Do /size first.`);
                    return interaction.reply({embeds: [embed]});
                }

                // User does not have coin
                const coinOfUser = Data.Coin.GetCoinOfUser(user.id);
                if(coinOfUser < sizeSurgeryCost)
                {
                    embed.setDescription(`Surgery cost \`${sizeSurgeryCost}\` coin. You only have \`${coinOfUser}\` coin.`);
                    return interaction.reply({embeds: [embed]});
                }

                const sizeAfter = -guildSize.GetSizeOfUser(user.id) - 1;
                guildSize.SetSizeOfUser(user.id, sizeAfter);
                Data.Coin.ChangeCoinOfUserByAmount(user.id, -sizeSurgeryCost);
                if(sizeAfter >= 0)
                {
                    embed.setDescription(`The operation was a success! Your \`${sizeAfter}\` inch deep \`pussy\` is now a \`${sizeAfter}\` inch long \`cock\`.`);
                    return interaction.reply({embeds: [embed]});
                }
                embed.setDescription(`The operation was a success! Your \`${Math.abs(sizeAfter + 1)}\` inch long \`cock\` is now a \`${Math.abs(sizeAfter + 1)}\` inch deep \`pussy\`.`);
                return interaction.reply({embeds: [embed]});
            }
        }
	},
};
