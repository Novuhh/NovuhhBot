const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Data = require("../../util/user_data.js")
const NoDependents = require('../../util/helper_no_dependents.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modify_cred')
		.setDescription('Modify the social credit of a user.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user\'s whos social credit to modify')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('The amount of social credit to change by')
            .setRequired(true)
        )
		.setDefaultPermission(false),
	async execute(interaction) {        
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if(user.id == interaction.user.id && !(interaction.guild.ownerId == interaction.user.id || NoDependents.IsNova(interaction.user.id)))
        {
            return interaction.reply({content: `You can't modify your own or any other admin's social credit score. (Unless you're the server owner)`, ephemeral: true});
        }

        const guildSocialCred = new Data.SocialCredit(interaction.guildId);
        const member = interaction.guild.members.cache.get(user.id);
        guildSocialCred.ChangeSocialCreditOfUserByAmount(member, amount, interaction);

        const embed = new MessageEmbed()
            .setTitle('Social Credit Change')
            .setColor('PURPLE')
            .setDescription(`${interaction.user} has modified the social cedit of ${user} by \`${amount}\` and is now \`${guildSocialCred.GetSocialCreditOfUser(user.id)}\`.`)
        return interaction.reply({embeds: [embed]});
	},
};
