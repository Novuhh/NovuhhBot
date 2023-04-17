const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Data = require("../../util/user_data.js")
const { credLostPerBlacklistPhrase } = require('../../data/constants.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('banned_words')
		.setDescription('Shows all of the phrases that one should not say.'),
	async execute(interaction) {
        const guildBlacklist = new Data.Blacklist(interaction.guildId)

        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`${interaction.guild.name}'s Banned Phrases`)
            .setDescription(`Your social credit will be lowered by \`${credLostPerBlacklistPhrase}\` for each banned phrase you say.`)

        if(guildBlacklist.GetBlacklistDelete())
        {
            embed.addFields({name: 'Delete Orginal Message', value: "Yes"});
        }
        else
        {
            embed.addFields({name: 'Delete Orginal Message', value: "No"}); 
        }

        if(guildBlacklist.GetBlacklistArray().length == 0)
        {
            embed.addFields({name: 'Phrases:', value: `There are no banned phrases at the moment.`});
        }
        else
        {
            embed.addFields({name: 'Phrases:', value: guildBlacklist.GetBlacklistArray().join('\n')});
        }
        return interaction.reply({embeds: [embed]})
	},
};
