const Data = require("../../util/user_data.js");

module.exports = {
	name: "unsetwaifuowner",
	description: `Free a waifu of their owner`,
	permission: 3,
	devGuildOnly: false,
	async execute(message) {
        const waifu = message.mentions.users.first();
        const guildWaifu = new Data.Waifu(message.guildId);
        const waifuOwnerID = guildWaifu.GetWaifuOwnerID(waifu.id);
        if(!waifuOwnerID) 
        {
            return message.channel.send({content:`${waifu} is not owned by anyone.`, allowedMentions: { repliedUser: false }});
        }
        guildWaifu.SetWaifuValue(waifu.id, null);
        guildWaifu.SetWaifuOwnerID(waifu.id, null);
        return message.channel.send({content: `${waifu} is no longer owned by <@${waifuOwnerID}>.`, allowedMentions: { repliedUser: false }});
	},
};