const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Data = require("../../util/user_data.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('request_data')
		.setDescription('I collect your data, wanna see what I know?'),
	async execute(interaction) {

        const embed = new MessageEmbed()
            .setTitle('Your user data')
            .setColor('LUMINOUS_VIVID_PINK')
            .setDescription('Below is anything and everything that I store data about you. I may use data given by discord for some commands but unless it is listed below, I do not store it.')

        // Size

        // Coin

        // Gamble

        // Social credit

        // Waifu

        // Bitmap

        // Feedback
        
		return interaction.reply({embeds: [embed], ephemeral: true});
	},
};
