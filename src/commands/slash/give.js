const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Data = require("../../util/user_data.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('give')
		.setDescription('Give a user some of your coin')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('The user to give your coin to')
            .setRequired(true))
		.addIntegerOption(option => 
            option.setName('amount')
            .setDescription('Amount of coin to give')
            .setMinValue(1)
            .setRequired(true)),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        const embed = new EmbedBuilder().setColor('Random');

        if(user.id == interaction.user.id)
        {
            embed.setDescription('Why would you want to give yourself your own coin?');
            return interaction.reply({embeds: [embed]});
        }
        
        if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
        {
            embed.setDescription(`You don't have enough coin to give away \`${amount}\`. You only have \`${Data.Coin.GetCoinOfUser(interaction.user.id)}\`.`);
            return interaction.reply({embeds: [embed]});
        }

        Data.Coin.CoinTransfer(interaction.user.id, user.id, amount);
        embed.setDescription(`${interaction.user} just gave \`${amount}\` coin to ${user}.`);
        return interaction.reply({embeds: [embed]});
	},
};
