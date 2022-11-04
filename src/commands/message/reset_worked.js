const Data = require("../../util/user_data.js");

module.exports = {
	name: "resetworked",
	description: "Reset the social credit of a user",
	permission: 4,
	devGuildOnly: false,
	async execute(message) {
        const user = message.mentions.users.first();
        if(!user) 
        {
            return message.channel.send(`Follow the format: ${new Data.GuildData(message.guildId).GetPrefix()}resetcred [@user]`);
        }
        new Data.SocialCredit(message.guildId).SetSocialCreditOfUser(user.id, null);
        return message.channel.send(`Resetting social credit of \`${user.username}\`.`);
	},
};