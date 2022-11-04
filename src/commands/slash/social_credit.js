const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Data = require("../../util/user_data.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('social_credit')
		.setDescription('See how much social credit you or someone else has')
		.addUserOption(option => option.setName('target').setDescription('The person whos cred you want to see')),
	async execute(interaction) {
		const guildSocialCred = new Data.SocialCredit(interaction.guildId)
		let user = interaction.options.getUser('target');
		if(!user) 
            user = interaction.user;
		const embed = new MessageEmbed().setColor('RANDOM').setDescription(`${user} has a social credit score of \`${guildSocialCred.GetSocialCreditOfUser(user.id)}\`.`);
		return interaction.reply({embeds: [embed]});
	},
};
