const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
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
            .setRequired(true))
        .setDMPermission(true),
	async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const embed = new EmbedBuilder().setColor('Random').setTitle('Heads or Tails')

        if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
        {
            embed.setDescription(`You can't gamble more coin than you have. You only have \`${Data.Coin.GetCoinOfUser(interaction.user.id)}\` coin.`);
            return interaction.reply({embeds: [embed]});
        }

        const headHash = NoDependents.GenerateUserHash(interaction.user.id, 8);
        const tailHash = NoDependents.GenerateUserHash(interaction.user.id, 8);
        const gameRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(headHash)
                .setLabel('Heads')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false),
                new ButtonBuilder()
                .setCustomId(tailHash)
                .setLabel('Tails')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false)
            );

        const playAgainHash = NoDependents.GenerateUserHash(interaction.user.id, 8);
        const playAgainRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(playAgainHash)
                .setLabel('Play Again')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false)
            );
        
        embed.setDescription('I am going to flip a coin, call the side you want to see facing up.');
        let reply = await interaction.reply({ embeds: [embed], components: [gameRow] });
        console.log(reply);

        // Disable all components of a interaction after 10 minutes
        setTimeout(NoDependents.DisableAllInteractionComponents, 10 * 60 * 1000, interaction);

        const filter = (btnInt) => {
            return btnInt.customId == headHash || btnInt.customId == tailHash || btnInt.customId == playAgainHash;
        }
        
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 30 * 1000,
            ComponentType: ComponentType.Button
        })
        setTimeout(function(){ collector.stop() }, 10 * 60 * 1000);

        let coinWon = 0;

        collector.on('end', () => {
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
            embed.setDescription(output);
            interaction.editReply({ embeds: [embed] }).catch(console.error);
            //NoDependents.DisableAllInteractionComponents(interaction);
        })

        collector.on('collect', buttonInt => {
            if(buttonInt.user.id !== interaction.user.id)
            {   
                return buttonInt.reply({ content: `These buttons aren't for you.`, ephemeral: true });
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
