const { SlashCommandBuilder } = require('@discordjs/builders');
const Data = require("../../util/user_data.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coin')
		.setDescription('See how much coin you or someone else has')
		.addUserOption(option => option.setName('target').setDescription('The person whos coin you want to see'))
		.setDMPermission(true),
	async execute(interaction) {
		let user = interaction.options.getUser('target');
		if(!user) 
            user = interaction.user;
		return interaction.reply(`\`${user.username}\` has \`${Data.Coin.GetCoinOfUser(user.id)}\` coin.`);
	},
};
