const { GetDevGuilds } = require("../../util/user_data.js");

module.exports = {
	name: "getdevguilds",
	description: "Get the current dev guilds",
	permission: 4,
	devGuildOnly: false,
	async execute(message) {
        const devGuilds = GetDevGuilds();
        if(devGuilds.length == 0)
        {
            return message.reply('There are currently no dev guilds.')
        }
        return message.reply(`The current dev guild(s) are: \`${devGuilds.join('\`, \`')}\`.`)
	},
};
