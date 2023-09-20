const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const { version } = require('../../../package.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Get the details about myself'),
	async execute(interaction) {
        let time = interaction.client.uptime;
        let uptime = "";
        // Days
        if(time / 86400000 >= 1)
        {
            uptime += `\`${Math.floor(time / 86400000)}\` Days, `;
            time -= Math.floor(time / 86400000) * 86400000;
        }
        // Hours
        if(time / 3600000 >= 1)
        {
            uptime += `\`${Math.floor(time / 3600000)}\` Hours, `;
            time -= Math.floor(time / 3600000) * 3600000;
        }
        // Minutes
        if(time / 60000 >= 1)
        {
            uptime += `\`${Math.floor(time / 60000)}\` Minutes, `;
            time -= Math.floor(time / 60000) * 60000;
        }
        // Seconds
        uptime += `\`${Math.floor(time / 1000)}\` Seconds`;
        time -= Math.floor(time / 1000) * 1000;

        const sauce = new ButtonBuilder()
            .setLabel('Source Code')
            .setURL('https://github.com/Novuhh/NovuhhBot')
            .setStyle(ButtonStyle.Link);

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle("Hi I'm Novuhh")
            .setThumbnail('https://i.imgur.com/LCYUHD2.png')
            .setDescription('For a full list of the commands I follow, use /help')
            .addFields([
                {name: "What do you do?", value: "I am an economy and social credit bot with some other features. Work a job, gamble your paycheck, then curse out the dear leader and lose 1000 social credit."},
                {name: "Why do you exist?", value: "Why do any of us exist? I don\'t know why exactly but one day my creator <@262791799444078594> made me so here I am."},
                {name: "Time Since Last Crash", value: uptime}
            ])
            .setFooter({text: `Currently running version: ${version}`});
		interaction.reply({embeds: [embed], components: [new ActionRowBuilder().addComponents( sauce )]})
	},
};
