const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Data = require("../../util/user_data.js")
const { credLostPerBlacklistPhrase } = require('../../data/constants.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('banned_words')
		.setDescription('Shows all of the phrases that one should not say.'),
	async execute(interaction) {
        const guildBlacklist = new Data.Blacklist(interaction.guildId)

        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`${interaction.guild.name}'s Banned Phrases`)
            .setDescription(`Your social credit will be lowered by \`${credLostPerBlacklistPhrase}\` for each banned phrase you say.`)

        if(guildBlacklist.GetBlacklistDelete())
        {
            embed.addField('Delete Orginal Message', "Yes");
        }
        else
        {
            embed.addField('Delete Orginal Message', "No"); 
        }

        if(guildBlacklist.GetBlacklistArray().length == 0)
        {
            embed.addField('Phrases:', `There are no banned phrases at the moment.`);
        }
        else
        {
            embed.addField('Phrases:', guildBlacklist.GetBlacklistArray().join('\n'));
        }
        return interaction.reply({embeds: [embed]})
	},
};
