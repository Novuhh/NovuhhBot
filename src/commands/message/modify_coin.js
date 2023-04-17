const Data = require("../../util/user_data.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: "modifycoin",
	description: "Modify the coin of a user",
	permission: 4,
	devGuildOnly: false,
	async execute(message) {
        const messageContent = message.content.split(' ');
        const user = message.mentions.users.first();
        const amount = messageContent[2];
        const embed = new EmbedBuilder().setTitle('Modifying Coin of User');
        if(user == null || amount == null || isNaN(amount))
        {
            embed.setColor('Red').setDescription(`Follow the proper format: ${new Data.GuildData(message.guildId).GetPrefix()}modifycoin [@user] [amount]`);
            return message.channel.send({embeds: [embed]});
        }
        Data.Coin.ChangeCoinOfUserByAmount(user.id, amount);
        embed.setColor('Green').setDescription(`${user.username} has had their coin balance modified by \`${amount}\`. Their balance is now \`${Data.Coin.GetCoinOfUser(user.id)}\` coin.`)
        return message.channel.send({embeds: [embed]});
	},
};
