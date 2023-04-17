const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Data = require("../../util/user_data.js")
const { coinleadboardsize } = require('../../data/constants.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coin_leader')
	    .setDescription(`Gets the top ${coinleadboardsize} richest people.`)
        .setDMPermission(true),
    async execute(interaction) {
        const leaderData = Data.Coin.CoinLeader();
        
        let output = ``;
        for(const value in leaderData)
            output += `${parseInt(value) + 1}: <@${leaderData[value][1]}> - \`${leaderData[value][0]}\` coin\n`;

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`The top ${leaderData.length} richest people are:`)
            .setDescription(output)
        return interaction.reply({embeds: [embed]});
    },
};
