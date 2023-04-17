const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const NoDependents = require("../../util/helper_no_dependents.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slots_paytable')
		.setDescription('Gets the paytable of the slot machine.')
        .setDMPermission(true),
	async execute(interaction) {
        const cherry = NoDependents.SlotReels.GetCherry(), bar = NoDependents.SlotReels.GetBar(), 
              bar2 = NoDependents.SlotReels.GetBar2(),     bar3 = NoDependents.SlotReels.GetBar3(), 
              seven = NoDependents.SlotReels.GetSeven(),   jackpot = NoDependents.SlotReels.GetJackpot();
        output = `Reels | Payout`;
        output += `\n${jackpot}${jackpot}${jackpot} - 1048`;
        output += `\n${seven}${seven}${seven} - 128`;
        output += `\n${bar3}${bar3}${bar3} - 64`;
        output += `\n${bar2}${bar2}${bar2} - 16`;
        output += `\n${bar}${bar}${bar} - 8` 
        output += `\n${cherry}${cherry}${cherry} - 8`;
        output += `\nAny two of the same: \n${cherry}, ${bar}, ${bar2}, ${bar3} - 4`;
        output += `\nAny ${cherry} - 1`;
        output += `\n${jackpot}${jackpot} - Multiply winnings by 16`;
        output += `\n${jackpot} - Multiply winnings by 4`;
        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle(`The paytable for a bet of 1 coin is as follows:`)
            .setDescription(output);
        return interaction.reply({embeds: [embed]});
	},
};
