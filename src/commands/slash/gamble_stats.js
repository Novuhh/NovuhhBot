const { SlashCommandBuilder } = require('@discordjs/builders');
const Data = require("../../util/user_data.js");
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gamble_stats')
		.setDescription('Learn how much you have gambled... and lost'),
	async execute(interaction) {
        const user = interaction.user;
        const payin = Data.Gamble.GetGambleLostOfUser(user.id);
        const embed = new MessageEmbed().setColor('RANDOM').setTitle(`${user.username}'s Gambling Stats`);
        if(payin == 0)
        {
            embed.setDescription(`${user} has not gambled at all yet. Nothing won, but also nothing lost.`);
            return interaction.reply({embeds: [embed]});
        }
        const payout = Data.Gamble.GetGambleWonOfUser(user.id);
        const slotPulls = Data.Gamble.GetLeverPulls(user.id);
        embed.addFields(
            {name: "Won Gambling", value: `\`${payout.toLocaleString("en-US")}\` coin`},
            {name: "Total Gambled", value: `\`${payin.toLocaleString("en-US")}\` coin`},
            {name: "Return Rate", value: `${Math.floor((payout/payin)*10000)/100}%`},
            {name: "Slots", value: `You have pulled the slot machine handle \`${slotPulls.toLocaleString("en-US")}\` times`}
        )
        return interaction.reply({embeds: [embed]});
	},
};
