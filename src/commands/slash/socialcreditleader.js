const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder} = require('discord.js');
const Data = require("../../util/user_data.js")
const { leaderboardSize } = require('../../data/constants.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('social_credit_leader')
		.setDescription(`Gets the top ${leaderboardSize/2} highest and lowest social credit holders.`),
	async execute(interaction) {
		const guildSocialCred = new Data.SocialCredit(interaction.guildId)
		const leaderData = guildSocialCred.SocialCreditLeader();
        
		// No social credit data for anyone
		if(leaderData.length == 0)
			return interaction.reply(`No one in this society has any social credit.`);

		// Output top 50% rounding up entries into first embed
		let valueOutput = ``;
		for(let i = 0; i < Math.ceil(leaderData.length / 2.0); i++)
			valueOutput += `${i + 1}: <@${leaderData[i][1]}> - \`${leaderData[i][0]}\` cred\n`;
		const valueEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`The top ${Math.ceil(leaderData.length / 2.0)} most valuable people in our society are:`)
            .setDescription(valueOutput)
		if(leaderData.length == 1)
			return interaction.reply({embeds: [valueEmbed]})

		// Output bottom 50% rounding down entries into second embed
		let uslessOutput = ``;
		for(let i = leaderData.length - 1; i >= Math.floor(leaderData.length / 2.0); i--)
			uslessOutput += `${leaderData.length - i}: <@${leaderData[i][1]}> - \`${leaderData[i][0]}\` cred\n`;
		const uselessEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`The bottom ${Math.floor(leaderData.length / 2.0)} most usless people in our society are:`)
            .setDescription(uslessOutput)

		interaction.reply({
            embeds: [valueEmbed, uselessEmbed]
        });
	},
};
