const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { slotEmojis } = require('../../data/constants.json');
const [ cherry, bar, bar2, bar3, seven, jackpot ] = [slotEmojis.cherry, slotEmojis.bar, slotEmojis.bar2, slotEmojis.bar3, slotEmojis.seven, slotEmojis.jackpot];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slots_paytable')
		.setDescription('Gets the paytable of the slot machine.')
        .setDMPermission(true),
	async execute(interaction) {
        output = `Reels | Payout` +
            `\n${jackpot}${jackpot}${jackpot} - 1048` +
            `\n${seven}${seven}${seven} - 128` +
            `\n${bar3}${bar3}${bar3} - 64` + 
            `\n${bar2}${bar2}${bar2} - 16` +
            `\n${bar}${bar}${bar} - 8` + 
            `\n${cherry}${cherry}${cherry} - 8` +
            `\nAny two of the same: \n${cherry}, ${bar}, ${bar2}, ${bar3} - 4` +
            `\nAny ${cherry} - 1` + 
            `\n${jackpot}${jackpot} - Multiply winnings by 16` +
            `\n${jackpot} - Multiply winnings by 4`;
        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle(`The paytable for a bet of 1 coin is as follows:`)
            .setDescription(output);
        return interaction.reply({embeds: [embed]});
	},
};
