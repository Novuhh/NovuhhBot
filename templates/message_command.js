// Permission Level
// 0, null, or anything not listed below - Disabled
// 1 - Everyone
// 2 - Admins
// 3 - Server owner
// 4 - Developers

module.exports = {
	name: "ping",
	description: "get a response from the bot",
	permission: 1,
	devGuildOnly: false,
	parameters: "[parameter] [optional parameter]",
	async execute(message) 
	{
		message.reply('pong');
	},
};
