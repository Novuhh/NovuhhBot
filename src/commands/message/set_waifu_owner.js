const Data = require("../../util/user_data.js");
const { minWaifuValue, maxWaifuValue } = require("../../data/constants.json");

module.exports = {
	name: "setwaifuowner",
	description: `Set a waifu to be owned by another person`,
	permission: 3,
	devGuildOnly: false,
	async execute(message) {
        const waifu = message.mentions.users.first();
        const owner = message.mentions.users.last();
        if(!waifu || !owner || (waifu == owner))
        {
            return message.channel.send(`Proper format is: ${new Data.GuildData(message.guildId.id).GetPrefix()}setwaifuowner [@waifu] [@newOwner] [optional value]`);
        }
        let value = 1000;
        if(!isNaN(parseInt(message.content.split(' ')[3])))
        {
            value = parseInt(message.content.split(' ')[3]);
        }
        if(value > maxWaifuValue || value < minWaifuValue)
        {
            return message.channel.send(`Waifu value must be between \`${minWaifuValue}\` and \`${maxWaifuValue}\`.`);
        }
        const guildWaifu = new Data.Waifu(message.guildId);
        guildWaifu.SetWaifuValue(waifu.id, value);
        guildWaifu.SetWaifuOwnerID(waifu.id, owner.id);
        return message.channel.send({content:`${owner} is now the owner of ${waifu} valued at \`${value}\``, allowedMentions: { repliedUser: false }});
	},
};