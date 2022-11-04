const { SlashCommandBuilder } = require('@discordjs/builders');
const Data = require("../../util/user_data.js")
const { coinPerCred } = require('../../data/constants.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bond')
		.setDescription('Buy a government bond using coin to raise your social cred')
		.addIntegerOption(option => 
            option.setName('coin_amount')
            .setDescription(`The value of the bond you want to buy (${coinPerCred} coin = 1 cred)`)
            .setRequired(true)
            .setMinValue(coinPerCred)),
	async execute(interaction) {
        const amount = interaction.options.getInteger('coin_amount');

        const coinOfUser = Data.Coin.GetCoinOfUser(interaction.user.id);
        if(amount > coinOfUser)
        {
            return interaction.reply(`You can't buy a bond for more coin than you have. You only have \`${coinOfUser}\` coin.`);
        }

        const guildSocialCred = new Data.SocialCredit(interaction.guildId)
        const credIncrease = Math.floor(amount / coinPerCred);

        guildSocialCred.ChangeSocialCreditOfUserByAmount(interaction.member, credIncrease, interaction);
        Data.Coin.ChangeCoinOfUserByAmount(interaction.user.id, -amount);
        console.log(`${Date()} : [${interaction.user.username}] bought a bond worth [${amount}] coin raising their cred by [${credIncrease}]`);

        return interaction.reply(`\`${interaction.user.username}\` bought a bond worth \`${amount}\` coin raising their cred by \`${credIncrease}\`.`);
	},
};
