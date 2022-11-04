const Data = require("../../util/user_data.js");
const { defaultSocialCred } = require("../../data/constants.json");

module.exports = {
	name: "resetcred",
	description: `Reset the social credit of a user to ${defaultSocialCred}`,
	permission: 3,
	devGuildOnly: true,
	async execute(message) {
        const user = message.mentions.users.first();
        if(!user) 
        {
            return message.channel.send(`Follow the format: ${new Data.GuildData(message.guildId).GetPrefix()}resetcred [@user]`);
        }
        new Data.SocialCredit(message.guildId).SetSocialCreditOfUser(user.id, null);
        return message.channel.send({content: `Resetting social credit of ${user.username} back to ${defaultSocialCred}`, allowedMentions: { repliedUser: false }});
	},
};