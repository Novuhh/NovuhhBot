const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const Data = require("../../util/user_data.js");
const { maxPrefixLength } = require("../../data/constants.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prefix')
		.setDescription('Change the prefix of the message commands')
        .addStringOption(option => option
            .setName("new_prefix")
            .setDescription("What the new prefix will be")
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
        const newPrefix = interaction.options.getString("new_prefix");
        if(newPrefix.contains(' ')){ return interaction.reply('The space character is now allowed in the prefix'); }
        if(newPrefix >= maxPrefixLength){ return interaction.reply(`Pick a smaller prefix, that would be less of a pain to type.`); }
        const guildData = new Data.GuildData(interaction.guild.id);
        guildData.SetPrefix(newPrefix);
        return interaction.reply({content: `${interaction.user} has changed the prefix to: \`${guildData.GetPrefix()}\``, allowedMentions: { repliedUser: false }});
	},
};
