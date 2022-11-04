const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
const Data = require("../../util/user_data.js")
const NoDependents = require('../../util/helper_no_dependents.js');
const { cards } = require('../../data/constants.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Gamble your coin with a game of blackjack')
		.addIntegerOption(option => 
            option.setName('amount')
            .setDescription('The amount of coin to you want to gamble')
            .setMinValue(1)
            .setRequired(true)),
	async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        const embed = new MessageEmbed()
            .setColor('DARK_BUT_NOT_BLACK')
            .setTitle('Welcome to the Blackjack Table')

        if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
        {
            embed.setDescription(`You can't gamble more coin than you have. You only have \`${Data.Coin.GetCoinOfUser(interaction.user.id)}\` coin.`);
            return interaction.reply({embeds: [embed]});
        }

        // Set up game 
        const hitHash = NoDependents.GenerateRandomHash(32);
        const standHash = NoDependents.GenerateRandomHash(32);
        const doubleHash = NoDependents.GenerateRandomHash(32);
        const hitButton = new MessageButton()
            .setCustomId(hitHash)
            .setLabel('Hit')
            .setStyle('SUCCESS')
            .setDisabled(false);
        const standButton = new MessageButton()
            .setCustomId(standHash)
            .setLabel('Stand')
            .setStyle('DANGER')
            .setDisabled(false);
        const doubleButton = new MessageButton()
            .setCustomId(doubleHash)
            .setLabel('Double')
            .setStyle('PRIMARY')
            .setDisabled(false);

        if(Data.Coin.GetCoinOfUser(interaction.user.id) < 2 * amount)
        {
            doubleButton.setDisabled(true);
        }

        const gameRow = new MessageActionRow()
            .addComponents(
                hitButton,
                standButton,
                doubleButton
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
        
        // Set up the hands for the game + other game variables      
        let dealerHand = [];
        let dealerTotal = 0;
        let playerHand = [];
        let playerTotal = 0;
        let aceIndexs = [0];
        let coinWon = 0;
        let paidOut = false;

        // Functions to help shorten the calls and make it easier
        function ShowGame()
        {
            embed.setFields([]);
            embed.addField(`Dealer's hand:`, dealerHand.join(''));
            embed.addField(`Player's hand:`, playerHand.join(''));
        }

        function NewCard()
        { 
            let index = Math.ceil((Math.random() * 13));
            let value = index;
            if(index == 1) { value = 11; }
            if(index > 10) { value = 10; }
            return [cards[index], value];
        }

        function AddCardToDealerHand()
        {
            let card = NewCard()
            dealerHand.push(card[0]);
            dealerTotal += card[1];
        }

        function AddCardToPlayerHand()
        {
            let card = NewCard()
            playerHand.push(card[0]);
            playerTotal += card[1];
        }

        function PlayerWon(betAmount = 0)
        {
            coinWon += betAmount + amount;
            Data.Coin.ChangeCoinOfUserByAmount(interaction.user.id, betAmount + amount);
            Data.Gamble.ChangeGambleWonOfUser(interaction.user.id, betAmount);
            Data.GambleStats.ChangeBlackjackPayoutByAmount(betAmount);
            UpdateFooter();
            paidOut = true;
        }

        function PlayerLost(betAmount = 0)
        {
            Data.Gamble.ChangeGambleLostOfUser(interaction.user.id, amount);
            Data.GambleStats.ChangeBlackjackPayinByAmount(amount);
            UpdateFooter();
            paidOut = true;
        }

        function ResetGame()
        {
            playerHand = [];
            playerTotal = 0;
            dealerHand = []
            dealerTotal = 0;
            aceIndexs = [0]
            paidOut = false;
            AddCardToPlayerHand()
            AddCardToPlayerHand()
            AddCardToDealerHand()
            dealerHand.push(cards[0]);        
            doubleButton.setDisabled(Data.Coin.GetCoinOfUser(interaction.user.id) < 2 * amount);
            Data.Coin.ChangeCoinOfUserByAmount(interaction.user.id, -amount);
            coinWon -= amount;
            UpdateFooter();
            // Pocket aces
            if(playerTotal == 22)
            {
                playerTotal = 12;
                aceIndexs = [1];
            }
        }

        function CheckDealerHand(betAmount = 0, secondVar = 0)
        {
            aceIndexs = [0];
            dealerHand.pop();
            while(dealerTotal < 17)
            {
                AddCardToDealerHand();
                const aceIndex = dealerHand.indexOf(cards[1], aceIndexs[aceIndexs.length - 1]);
                if(dealerTotal > 21 && aceIndex != -1)
                {
                    dealerTotal -= 10;
                    aceIndexs.push(aceIndex + 1);
                }
            }
            ShowGame();
            // Dealer Busts
            if(dealerTotal > 21)
            {
                PlayerWon(betAmount);
                embed.addField('Result:', `The dealer has bust. You won \`${betAmount}\` coin.`);
            }
            // Player loses
            else if (dealerTotal > playerTotal)
            {
                PlayerLost(secondVar);
                embed.addField('Result:', `The dealer has beat your hand. You lost \`${betAmount + secondVar}\` coin.`);
            }
            // Push
            else if (dealerTotal == playerTotal)
            {
                embed.addField('Result:', `Push. You didn't win or lose anything.`);
            }
            // Beat dealer's hand
            else
            {
                PlayerWon(betAmount);
                embed.addField('Result:', `You beat the dealer's hand. You won \`${betAmount}\` coin.`)
            }
            playAgainButton.setDisabled(Data.Coin.GetCoinOfUser(interaction.user.id) < amount);
            interaction.editReply({
                embeds: [embed],
                components: [playAgainRow]
            }).catch(console.error);
        }

        function UpdateFooter()
        {
            embed.setFooter({text: `Bet: ${amount}\tCoin Won/Lost: ${coinWon}\tCoin left: ${Data.Coin.GetCoinOfUser(interaction.user.id)}`})
        }

        // Start the game
        ResetGame();
        ShowGame();
        UpdateFooter();
        if(playerTotal == 21)
        {
            const handWon = Math.floor(1.5 * amount);
            PlayerWon(handWon);
            embed.addField('Result:', `Player Blackjack! You won \`${handWon}\` coin in this hand.`)
            await interaction.reply({ 
                embeds: [embed], 
                components: [playAgainRow]
            });
        }
        else
        {
            await interaction.reply({ 
                embeds: [embed], 
                components: [gameRow] 
            });
        }

        const filter = (btnInt) => {
            return btnInt.customId === hitHash || btnInt.customId === standHash || btnInt.customId === doubleHash || btnInt.customId === playAgainHash;
        }
        
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 30 * 1000
        });
        setTimeout(function(){ collector.stop() }, 10 * 60 * 1000);

        collector.on('end', (collection) => {
            embed.setDescription(`Thank you for playing blackjack.`);
            if(paidOut == false)
            {
                Data.Coin.ChangeCoinOfUserByAmount(interaction.user.id, Math.floor(amount / 2.0));
                coinWon += Math.floor(amount / 2.0);
                UpdateFooter();
                embed.setDescription(`${embed.description}\nYou have started a new hand but not finished it. You have been given back half of your bet.`)
            }
            if(coinWon > 0)
            {
                embed.setDescription(`${embed.description}\nYou won: \`${coinWon}\` coin in this blackjack gambling session.`);
            }
            else if(coinWon == 0)
            {
                embed.setDescription(`${embed.description}\nYou broke even in this blackjack gambling session.`)
            }
            else
            {
                embed.setDescription(`${embed.description}\nYou lost: \`${Math.abs(coinWon)}\` coin in this blackjack gambling session.`);
            }
            interaction.editReply({ embeds: [embed] }).catch(console.error);
            NoDependents.DisableAllInteractionComponents(interaction);
        });

        collector.on('collect', buttonInt => {
            if(buttonInt.user.id !== interaction.user.id)
            {
                return buttonInt.reply({ content: `These buttons aren't for you.`, ephemeral: true })
            }
            
            buttonInt.deferUpdate();
            
            collector.resetTimer();
            switch(buttonInt.customId)
            {
                case hitHash:
                {
                    doubleButton.setDisabled(true);
                    AddCardToPlayerHand();
                    ShowGame();
                    if(playerTotal > 21)
                    {
                        const aceIndex = playerHand.indexOf(cards[1], aceIndexs[aceIndexs.length - 1]);
                        // Bust
                        if(aceIndex == -1)
                        {
                            PlayerLost();
                            playAgainButton.setDisabled(Data.Coin.GetCoinOfUser(interaction.user.id) < amount);
                            embed.addField('Result:', `You bust and lost this hand. You lost \`${amount}\` coin.`);
                            interaction.editReply({
                                embeds: [embed], 
                                components: [playAgainRow] 
                            }).catch(console.error);
                        }
                        // Has ace
                        else
                        {
                            playerTotal -= 10;
                            aceIndexs.push(aceIndex + 1);
                            interaction.editReply({ 
                                embeds: [embed], 
                                components: [gameRow] 
                            }).catch(console.error);
                        }
                    }
                    else if (playerTotal == 21)
                    {
                        CheckDealerHand(amount);
                    }
                    else
                    {
                        interaction.editReply({ 
                            embeds: [embed], 
                            components: [gameRow] 
                        }).catch(console.error);
                    }
                    return;
                }

                case standHash:
                {
                    CheckDealerHand(amount);
                    return;
                }

                case doubleHash:
                {
                    AddCardToPlayerHand();
                    coinWon -= amount;
                    
                    if(playerTotal > 21)
                    {
                        // Would have bust but has ace
                        if(playerHand.indexOf(cards[1], aceIndexs[aceIndexs.length - 1]) != -1)
                        {
                            playerTotal -= 10;
                        }
                        else
                        {
                            PlayerLost(amount);
                            ShowGame();
                            playAgainButton.setDisabled(Data.Coin.GetCoinOfUser(interaction.user.id) < amount);
                            embed.addField('Result:', `You have bust and lost the hand. You lost \`${2 * amount}\` coin.`)
                            return interaction.editReply({
                                embeds: [embed],
                                components: [playAgainRow]
                            }).catch(console.error);
                        }
                    }
                    // Check dealer hand
                    CheckDealerHand(3 * amount, amount);
                    return;
                }

                case playAgainHash:
                {
                    if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
                    {
                        embed.setDescription(`You ran out of coin to keep playing.`);
                        return interaction.editReply({embeds: [embed], components: []}).catch(console.error);
                    }

                    paidOut = false;
                    ResetGame();
                    ShowGame();
                    if(playerTotal == 21)
                    {
                        const handWon = Math.floor(1.5 * amount);
                        PlayerWon(handWon);
                        embed.addField('Result:', `Player Blackjack! You won \`${handWon}\` coin in this hand.`);
                        interaction.editReply({components: [playAgainRow]}).catch(console.error);
                    }
                    else
                    {
                        interaction.editReply({components: [gameRow]}).catch(console.error);
                    }
                    return interaction.editReply({embeds: [embed]}).catch(console.error);
                }
            }
        }); 
	},
};