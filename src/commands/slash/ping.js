const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Gets the response time of the bot'),
	async execute(interaction) {
		interaction.reply({ content: 'Pong!', fetchReply: true })
		.then((message) => {
			interaction.editReply(`Pong! ${message.createdAt - interaction.createdAt} ms response time.`)
		})
		.catch(console.error);
	},
};
