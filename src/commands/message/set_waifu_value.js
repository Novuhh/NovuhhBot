const Data = require("../../util/user_data.js");
const { maxWaifuValue } = require("../../data/constants.json");

module.exports = {
	name: "setwaifuvalue",
	description: `Set a waifu's value for them`,
	permission: 3,
	devGuildOnly: false,
    parameters: "[@waifu] [new value]",
	async execute(message) {
        const waifu = message.mentions.users.first();
        const amount = parseInt(message.content.split(' ')[2]);
        if(!waifu || isNaN(amount)) 
        {
            return message.reply(`Proper format is: ${new Data.GuildData(message.guildId.id).GetPrefix()}setwaifuvalue [@user] [number]`);
        }
        if(amount > maxWaifuValue)
        {
            return message.reply(`Max waifu value is \`${maxWaifuValue}\`.`);
        }
        const guildWaifu = new Data.Waifu(message.guildId);
        if(amount <= 0)
        {
            if(guildWaifu.GetWaifuValue(waifu.id) == null)
            {
                return message.reply({content: `${waifu} is not able to be claimed to begin with. No change has been made.`, allowedMentions: { repliedUser: false }});
            }
            guildWaifu.SetWaifuValue(waifu.id, null);
            guildWaifu.SetWaifuOwnerID(waifu.id, null);
            return message.reply({content: `${waifu} is no longer able to be claimed.`, allowedMentions: { repliedUser: false }});
        }
        else
        {
            guildWaifu.SetWaifuValue(waifu.id, amount);
            return message.reply({content:`${waifu} has had their value set to \`${amount}\`.`, allowedMentions: { repliedUser: false }});
        }
	},
};