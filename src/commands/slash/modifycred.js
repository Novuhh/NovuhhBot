const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Data = require("../../util/user_data.js")

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
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {        
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if(user.id == interaction.user.id && !(interaction.guild.ownerId == interaction.user.id))
        {
            return interaction.reply({content: `You can't modify your own or any other admin's social credit score. (Unless you're the server owner)`, ephemeral: true});
        }

        const guildSocialCred = new Data.SocialCredit(interaction.guildId);
        const member = interaction.guild.members.cache.get(user.id);
        guildSocialCred.ChangeSocialCreditOfUserByAmount(member, amount, interaction);

        const embed = new EmbedBuilder()
            .setTitle('Social Credit Change')
            .setColor('Purple')
            .setDescription(`${interaction.user} has modified the social cedit of ${user} by \`${amount}\` and is now \`${guildSocialCred.GetSocialCreditOfUser(user.id)}\`.`)
        return interaction.reply({embeds: [embed]});
	},
};
