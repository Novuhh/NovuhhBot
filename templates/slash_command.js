const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Get a response from the bot'),
	async execute(interaction) {
        interaction.reply('pong');
	},
};
