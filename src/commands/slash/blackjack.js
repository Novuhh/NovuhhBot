const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
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
            .setRequired(true))
        .setDMPermission(true),
	async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        const embed = new EmbedBuilder()
            .setColor('DarkButNotBlack')
            .setTitle('Welcome to the Blackjack Table')

        if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
        {
            embed.setDescription(`You can't gamble more coin than you have. You only have \`${Data.Coin.GetCoinOfUser(interaction.user.id)}\` coin.`);
            return interaction.reply({embeds: [embed]});
        }

        // Set up game
        const hitHash = NoDependents.GenerateUserHash(interaction.user.id,8);
        const standHash = NoDependents.GenerateUserHash(interaction.user.id,8);
        const doubleHash = NoDependents.GenerateUserHash(interaction.user.id,8);
        const hitButton = new ButtonBuilder()
            .setCustomId(hitHash)
            .setLabel('Hit')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
        const standButton = new ButtonBuilder()
            .setCustomId(standHash)
            .setLabel('Stand')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false);
        const doubleButton = new ButtonBuilder()
            .setCustomId(doubleHash)
            .setLabel('Double')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(Data.Coin.GetCoinOfUser(interaction.user.id) < 2 * amount);

        const gameRow = new ActionRowBuilder()
            .addComponents(
                hitButton,
                standButton,
                doubleButton
            );

        const playAgainHash = NoDependents.GenerateUserHash(interaction.user, 8);
        const playAgainButton = new ButtonBuilder()
            .setCustomId(playAgainHash)
            .setLabel('Play Again')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
        const playAgainRow = new ActionRowBuilder()
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
            embed.setFields([]).addFields(
                {name: 'Dealer\'s hand', value: dealerHand.join('')},
                {name: 'Player\'s hand', value: playerHand.join('')}
            )
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
                embed.addFields({name: 'Result:', value: `The dealer has bust. You won \`${betAmount}\` coin.`});
            }
            // Player loses
            else if (dealerTotal > playerTotal)
            {
                PlayerLost(secondVar);
                embed.addFields({name: 'Result:', value: `The dealer has beat your hand. You lost \`${betAmount + secondVar}\` coin.`});
            }
            // Push
            else if (dealerTotal == playerTotal)
            {
                embed.addFields({name: 'Result:', value: `Push. You didn't win or lose anything.`});
            }
            // Beat dealer's hand
            else
            {
                PlayerWon(betAmount);
                embed.addFields({name: 'Result:', value:`You beat the dealer's hand. You won \`${betAmount}\` coin.`});
            }
            playAgainButton.setDisabled(Data.Coin.GetCoinOfUser(interaction.user.id) < amount);
            interaction.editReply({
                embeds: [embed],
                components: [playAgainRow]
            }).catch(console.error);
        }

        function UpdateFooter()
        {
            embed.setFooter({text: `Bet: ${amount}\tCoin Won/Lost: ${coinWon}\tCoin left: ${Data.Coin.GetCoinOfUser(interaction.user.id)}`}); 
        }

        // Start the game
        ResetGame();
        ShowGame();
        UpdateFooter();
        let interactionReply;
        if(playerTotal == 21)
        {
            const handWon = Math.floor(1.5 * amount);
            PlayerWon(handWon);
            embed.addFields({name: 'Result:', value: `Player Blackjack! You won \`${handWon}\` coin in this hand.`});
            interactionReply = await interaction.reply({ 
                embeds: [embed], 
                components: [playAgainRow]
            });
        }
        else
        {
            interactionReply = await interaction.reply({ 
                embeds: [embed], 
                components: [gameRow] 
            });
        }

        const filter = (btnInt) => {
            return btnInt.customId === hitHash || btnInt.customId === standHash || btnInt.customId === doubleHash || btnInt.customId === playAgainHash;
        }
        
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 30 * 1000,
            ComponentType: ComponentType.Button
        });
        setTimeout(function(){ collector.stop() }, 10 * 60 * 1000);

        collector.on('end', () => {
            let row;
            embed.setDescription(`Thank you for playing blackjack.`);
            if(paidOut == false)
            {
                Data.Coin.ChangeCoinOfUserByAmount(interaction.user.id, Math.floor(amount / 2.0));
                coinWon += Math.floor(amount / 2.0);
                UpdateFooter();
                embed.setDescription(`${embed.data.description}\nYou have started a new hand but not finished it. You have been given back half of your bet.`);
                row = gameRow;
            }
            else { row = playAgainRow; }
            if(coinWon > 0)
            {
                embed.setDescription(`${embed.data.description}\nYou won: \`${coinWon}\` coin in this blackjack gambling session.`);
            }
            else if(coinWon == 0)
            {
                embed.setDescription(`${embed.data.description}\nYou broke even in this blackjack gambling session.`)
            }
            else
            {
                embed.setDescription(`${embed.data.description}\nYou lost: \`${Math.abs(coinWon)}\` coin in this blackjack gambling session.`);
            }

            for(let button of row.components){ button.setDisabled(true); }
            interaction.editReply({ embeds: [embed], components: [row] }).catch(console.error);
        });

        collector.on('collect', buttonInt => {
            if(buttonInt.user.id !== interaction.user.id)
            {
                return buttonInt.reply({ content: `These buttons aren't for you.`, ephemeral: true });
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
                            embed.addFields({name: 'Result:', value: `You bust and lost this hand. You lost \`${amount}\` coin.`});
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
                            embed.addField({name: 'Result:', value: `You have bust and lost the hand. You lost \`${2 * amount}\` coin.`});
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
                        embed.addFields({name: 'Result:', value: `Player Blackjack! You won \`${handWon}\` coin in this hand.`});
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