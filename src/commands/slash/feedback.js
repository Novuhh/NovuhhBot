const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');
const rawData = fs.readFileSync('./src/data/feedback.json');
const feedbackJson = JSON.parse(rawData);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Give feedback about the bot, it can be anything.')
        .addStringOption(option => option
            .setName('feedback')
            .setDescription('Type your feedback here')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('mood')
            .setDescription('How do you currently feel about Novuhh. 1 being the worst - 5 being the best')
            .setMinValue(1)
            .setMaxValue(5)),
	async execute(interaction) {
        // Make the feedback class
        const moodOptions = interaction.options.getInteger('mood');
        const feedbackOption = interaction.options.getString('feedback');
        const feedback = new Feedback(interaction, moodOptions, feedbackOption);

        // Save the feedback
        feedbackJson.push(feedback);
        const stringified = JSON.stringify(feedbackJson, null, 2);   // turns data back into json format
        fs.writeFileSync('./src/data/feedback.json', stringified); //default: 'utf8'
        console.log(`${Date()} : ${interaction.user.username}[${interaction.user.id}] submitted feedback about Novuhh`);

        return interaction.reply({
            content: `Thank you for your feedback\nYou submitted:\nMood: ${feedback.mood}\nFeedback: ${feedback.feedback}`,
            ephemeral: true
        });
	},
};

class Feedback
{
    constructor(interaction, mood, feedback)
    {
        this.date = Date();
        this.username = interaction.user.username;
        this.userID = interaction.user.id;
        this.guild = interaction.guild.name;
        this.guildID = interaction.guild.id;
        this.mood = mood;
        this.feedback = feedback;
    }
}
