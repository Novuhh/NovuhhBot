const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const Data = require("../../util/user_data.js")
const NoDependents = require("../../util/helper_no_dependents.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('higher_or_lower')
		.setDescription('Gamble your coin with the higher or lower game')
		.addIntegerOption(option => 
            option.setName('amount')
            .setDescription('The amount of coin to you want to gamble')
            .setMinValue(1)
            .setRequired(true))
        .setDMPermission(true),
	async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
            return interaction.reply(`You can't gamble more coin than you have. You only have \`${Data.Coin.GetCoinOfUser(interaction.user.id)}\` coin.`);

        // Set up buttons for responses
        const userId = interaction.user.id;
        const higherhash = NoDependents.GenerateUserHash(userId);
        const equalHash = NoDependents.GenerateUserHash(userId);
        const lowerHash = NoDependents.GenerateUserHash(userId);
        const higherButton = new ButtonBuilder()
            .setCustomId(higherhash)
            .setLabel('Higher')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);
        const equalButton = new ButtonBuilder()
            .setCustomId(equalHash)
            .setLabel('Equal To')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);
        const lowerButton = new ButtonBuilder()
            .setCustomId(lowerHash)
            .setLabel('Lower')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);

        const row = new ActionRowBuilder()
            .addComponents(
                higherButton,
                equalButton,
                lowerButton
            );

        const playAgainHash = NoDependents.GenerateUserHash(interaction.user.id);
        const playAgainButton = new ButtonBuilder()
            .setCustomId(playAgainHash)
            .setLabel('Play Again')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);
        const playAgainRow = new ActionRowBuilder()
            .addComponents(
                playAgainButton
            );
        
        await interaction.reply({ 
            content: 'Two dice 6 sided dice will be rolled. Predicit if the sum is higher, equal or lower than 7.', 
            components: [row] 
        });
        
        const filter = (btnInt) => {
            return btnInt.customId === higherhash || btnInt.customId === equalHash || btnInt.customId === lowerHash || btnInt.customId === playAgainHash;
        }
        
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 30 * 1000
        })
        setTimeout(function(){ collector.stop() }, 10 * 60 * 1000);

        let coinWon = 0;

        collector.on('collect', buttonInt => {
            if(buttonInt.user.id !== interaction.user.id)
            {
                return buttonInt.reply({ content: `These buttons aren't for you.`, ephemeral: true })
            }

            buttonInt.deferUpdate();
            if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
                return collector.stop();
            collector.resetTimer();

            const customId = buttonInt.customId
            if(customId == playAgainHash)
            {
                return interaction.editReply({ 
                    content: 'Two dice 6 sided dice will be rolled. Predicit if the sum is higher, equal or lower than 7.', 
                    components: [row] 
                }).catch(console.error);
            }

            // Set up game variables
            const die1 = NoDependents.RollDie(6);
            const die2 = NoDependents.RollDie(6);
            const total = die1 + die2;

            // Determine if won
            let winAmount = amount;
            if(customId == equalHash && total == 7)
                winAmount = amount * 4

            if((customId == higherhash && total > 7) || (customId == equalHash && total == 7) || (customId == lowerHash && total < 7))
            {
                coinWon += winAmount;
                Data.Gamble.ChangeGambleWonOfUser(interaction.user.id, winAmount);
                Data.GambleStats.ChangeHigherOrLowerPayoutByAmount(winAmount);
                Data.Coin.ChangeCoinOfUserByAmount(interaction.user.id, winAmount);
                interaction.editReply({
                    content: `The dice were \`${die1} + ${die2} = ${total}\`. You bet \`${amount}\` and won \`${winAmount}\` coin. Bet it all pussy.`,
                    components: [playAgainRow]
                }).catch(console.error);
            }
            else
            {
                coinWon -= amount;
                Data.Gamble.ChangeGambleLostOfUser(interaction.user.id, amount);
                Data.GambleStats.ChangeHigherOrLowerPayinByAmount(amount);
                Data.Coin.ChangeCoinOfUserByAmount(interaction.user.id, -amount);
                interaction.editReply({
                    content: `The dice were \`${die1} + ${die2} = ${total}\`. You bet \`${amount}\` and lost it all.`,
                    components: [playAgainRow]
                }).catch(console.error);
            }
        });

        collector.on('end', async () => {
            let output =  `I guess you\'re done playing higher or lower for now.\n`;
            if(coinWon > 0)
            {
                output += `You won: \`${coinWon}\` coin in this higher or lower gambling session.`;
            }
            else if(coinWon == 0)
            {
                output += `You broke even in this higher or lower gambling session.`;
            }
            else
            {
                output += `You lost: \`${Math.abs(coinWon)}\` coin in this higher or lower gambling session.`;
            }
            interaction.editReply({ content:output }).catch(console.error);
            NoDependents.DisableAllInteractionComponents(interaction);
        });
	},
};
