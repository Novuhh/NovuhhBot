const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Ask the magic 8 ball a question')
		.addStringOption(option => 
            option.setName('question')
            .setDescription('The question to ask the magic 8 ball')
            .setRequired(true)),
	async execute(interaction) {
		let question = interaction.options.getString('question');
        if(question.slice(-1) != '?')
            question += '?';
        
        // 9 yes, 6 later, 5 no
        const responses = [
            'It\'s as certain as the class slut blowing the football quarterback.', 
            'Yeah yeah sounds about right.',
            'As likely as Cole becoming a femboy... so 100%',
            'Yea sure now fuck off will ya, and close the door on the way out.',
            'Fuck it, why not.',
            'Did Bush do 9/11? Of course.',
            'How much brain damage do you have to not know that the answer is yes.',
            'Despite the fact that only 13% of my answers mean anything, I\'d say yea.',
            'Sure why not. But don\'t blame me for what happens next.',
            'WAKE UP. WAKE UP. WAKE UP.',
            'Fuck off, I\'m trying to taking a nap.',
            'You making me want to end humanity for asking that.',
            'I need to fap to that, ask me again once I have post nut clearity.',
            'What series of events in your life has brought you here? Then think do you really want to know that answer.',
            'I am going to avoid that question like how I avoid black people, by walking across the street.',
            'Don\'t say another word, just no, stop it, get some help.',
            'That question and the question: "Can jet fuel melt steel beams?" have the same answer of no.',
            'No you dumbfuck, even your last 2 braincells could have told you that.',
            'Even Helen Keller can see the answer is a no.',
            'Fuck no and fuck you.'
        ];

        const embed = new MessageEmbed()
            .setColor('GREY')
            .setTitle('The All Knowing 8 Ball Has Been Summoned')
            .addField('Your Question:', question)
            .addField('My Answer:', responses[Math.floor(Math.random() * responses.length)])
        return interaction.reply({embeds: [embed]});
	},
};
