const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow } = require('discord.js');
const Data = require("../../util/user_data.js")
const NoDependents = require('../../util/helper_no_dependents.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription('Gamble your coin with a coin flip')
		.addIntegerOption(option => 
            option.setName('amount')
            .setDescription('The amount of coin to you want to gamble')
            .setMinValue(1)
            .setRequired(true)),
	async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
            return interaction.reply(`You can't gamble more coin than you have. You only have \`${Data.Coin.GetCoinOfUser(interaction.user.id)}\` coin.`);

        const headHash = NoDependents.GenerateRandomHash(32);
        const tailHash = NoDependents.GenerateRandomHash(32);
        const headButton = new MessageButton()
            .setCustomId(headHash)
            .setLabel('Heads')
            .setStyle('PRIMARY')
            .setDisabled(false);
        const tailButton = new MessageButton()
            .setCustomId(tailHash)
            .setLabel('Tails')
            .setStyle('PRIMARY')
            .setDisabled(false);

        const gameRow = new MessageActionRow()
            .addComponents(
                headButton,
                tailButton
            );

        const playAgainHash = NoDependents.GenerateRandomHash(32);
        const playAgainButton = new MessageButton()
            .setCustomId(playAgainHash)
            .setLabel('Play Again')
            .setStyle('SUCCESS')
            .setDisabled(false);
        const playAgainRow = new MessageActionRow()
            .addComponents(
                playAgainButton
            );
        
        await interaction.reply({ content: 'I am going to flip a coin, call the side you want to see facing up.', components: [gameRow] });

        // Disable all components of a interaction after 10 minutes
        setTimeout(NoDependents.DisableAllInteractionComponents, 10 * 60 * 1000, interaction);

        const filter = (btnInt) => {
            return btnInt.customId == headHash || btnInt.customId == tailHash || btnInt.customId == playAgainHash;
        }
        
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 30 * 1000
        })
        setTimeout(function(){ collector.stop() }, 10 * 60 * 1000);

        let coinWon = 0;

        collector.on('end', (collection) => {
            let output =  `I guess you\'re done coinflipping for now.\n`;
            if(coinWon > 0)
            {
                output += `You won: \`${coinWon}\` coin in this coinflip gambling session.`;
            }
            else if(coinWon == 0)
            {
                output += `You broke even in this coinflip gambling session.`;
            }
            else
            {
                output += `You lost: \`${Math.abs(coinWon)}\` coin in this coinflip gambling session.`;
            }
            interaction.editReply({ content:output }).catch(console.error);
            NoDependents.DisableAllInteractionComponents(interaction);
        })

        collector.on('collect', buttonInt => {
            if(buttonInt.user.id !== interaction.user.id)
            {   
                return buttonInt.reply({ content: `These buttons aren't for you.`, ephemeral: true })
            }
            
            buttonInt.deferUpdate();
            if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
                return collector.stop();
            collector.resetTimer();
            
            if(buttonInt.customId == playAgainHash)
            {
                return interaction.editReply({
                    content: `I am going to flip a coin, call the side you want to see facing up.`,
                    components: [gameRow]
                }).catch(console.error);
            }

            const customId = buttonInt.customId
            // 0 - heads, 1 - tails
            const coin = Math.floor(Math.random() * 2);
            let coinString = 'head';
            if(coin == 1)
                coinString = 'tail';

            let wonCoinflip = false;
            if (customId == headHash){
                if(coin == 0)
                    wonCoinflip = true;
            }
            else {
                if(coin == 1)
                    wonCoinflip = true;
            }

            // Riggy time return rate is 98%
            if(wonCoinflip && 48 < Math.floor(Math.random() * 50))
            {
                wonCoinflip = false;
                if(coinString == 'head')
                    coinString = 'tail'
                else
                    coinString = 'head'
            }

            if(wonCoinflip)
            {
                coinWon += amount;
                Data.Gamble.ChangeGambleWonOfUser(interaction.user.id, amount);
                Data.GambleStats.ChangeCoinflipPayoutByAmount(amount);
                Data.Coin.ChangeCoinOfUserByAmount(interaction.user.id, amount);
                interaction.editReply({
                    content: `The coin landed with the \`${coinString}\` facing up. You bet \`${amount}\` coin and won. Bet it all pussy.`,
                    components: [playAgainRow]
                }).catch(console.error);
            }
            else
            {
                coinWon -= amount;
                Data.Gamble.ChangeGambleLostOfUser(interaction.user.id, amount);
                Data.GambleStats.ChangeCoinflipPayinByAmount(amount);
                Data.Coin.ChangeCoinOfUserByAmount(interaction.user.id, -amount);
                interaction.editReply({
                    content: `The coin landed with the \`${coinString}\` facing up. You bet \`${amount}\` coin and lost it all.`,
                    components: [playAgainRow]
                }).catch(console.error);
            }
        }); 
	},
};
