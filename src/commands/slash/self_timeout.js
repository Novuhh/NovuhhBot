const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const NoDependents = require("../../util/helper_no_dependents.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('self_timeout')
		.setDescription('Time yourself out. Why?')
        .addNumberOption(option => option
            .setName('time')
            .setDescription(`How long are you going to time yourself out in minutes. Max time: 1440`)
            .setMinValue(1)
            .setMaxValue(1440)
            )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	async execute(interaction) {
        let time = interaction.options.getNumber('time')
        if(time == null){ time = 60; }

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} Is Timing Themself Out`)
            .setColor('NotQuiteBlack')

        if(interaction.member.moderatable)
        {
            interaction.member.timeout(time * 60 * 1000, `${interaction.user.username} timed out themself`);
            const date = new Date()
            embed.setDescription(`${interaction.user} timed out themself for \`${time}\` minute(s). They will be back at <t:${Math.floor(date.getTime() / 1000 + time * 60)}:T>`);
            return interaction.reply({embeds: [embed]});
        }
        
        if(NoDependents.IsAdmin(interaction.member))
        {
            return interaction.reply({
                content: `You're admin, you can't be timed out`,
                ephemeral: true
            });
        }

        embed.setDescription(`${interaction.user} tried to time out themself but I lack permissions to do so. (My role is lower in role hierarchy than theirs or I'm not admin)`);
        return interaction.reply({embeds: [embed]});
	},
};
