const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
const Data = require("../../util/user_data.js")
const Helper = require("../../util/helper_functions.js");
const NoDependents = require('../../util/helper_no_dependents.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slots')
		.setDescription('Pull the lever on the slot machine to gamble away your coin')
		.addIntegerOption(option => 
            option.setName('bet')
            .setDescription('The bet of coin for each slot machine pull')
            .setMinValue(1)
            .setRequired(true)),
	async execute(interaction) {
        const amount = interaction.options.getInteger('bet');
        const embed = new MessageEmbed().setTitle(`Welcome to the Slot Machine`).setColor('BLURPLE');

        if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
        {
            embed.setDescription(`You can't gamble more coin than you have. You only have \`${Data.Coin.GetCoinOfUser(interaction.user.id)}\` coin.`);
            return interaction.reply({embeds: [embed]});
        }

        // Set up buttons for responses
        const hash = NoDependents.GenerateRandomHash(32);
        const leverButton = new MessageButton()
            .setCustomId(hash)
            .setLabel('Pull Lever')
            .setStyle('PRIMARY')
            .setDisabled(false);
        const row = new MessageActionRow()
            .addComponents(
                leverButton
            );
        
        let lastSlotPull = Helper.Slots(null, 0)[0];
        let winnings = 0;
        let spent = 0;

        embed.setDescription(`${interaction.user} this is the slot machine you are sitting at with a bet of \`${amount}\` coin per handle pull.\n${lastSlotPull}`)
        .setFooter({text: `You've won: ${winnings}\nYou've spent: ${spent}`})
        await interaction.reply({ 
            embeds: [embed], 
            components: [row] 
        });

        // Disable all components of a interaction after 10 minutes
        setTimeout(NoDependents.DisableAllInteractionComponents, 10 * 60 * 1000, interaction);

        const filter = (btnInt) => { return btnInt.customId == hash; }
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 30 * 1000
        })
        setTimeout(function(){ collector.stop() }, 10 * 60 * 1000);

        collector.on('collect', (btnInt) => {
            if(btnInt.user.id !== interaction.user.id)
            {
                return btnInt.reply({ content: `This slot machine isn't for you!`, ephemeral: true });
            }
            collector.resetTimer();
            if(amount > Data.Coin.GetCoinOfUser(interaction.user.id))
            {
                embed.setDescription(`${interaction.user} you don't have enough coin to keep betting \`${amount}\`. Maybe go to a slot machine with a smaller bet.\n${lastSlotPull}`);
                interaction.editReply({embeds: [embed]}).catch(console.error);
                NoDependents.DisableAllInteractionComponents(interaction);
                btnInt.deferUpdate();
                return;
            }

            let slot = Helper.Slots(interaction.user.id, amount)
            lastSlotPull = slot[0];
            winnings += slot[1];
            spent += amount

            embed.setDescription(`${interaction.user} this is the slot machine you are sitting at with a bet of \`${amount}\` coin per handle pull.\n${lastSlotPull}`)
            .setFooter({text: `You've won: ${winnings}\nYou've spent: ${spent}`})
            interaction.editReply({
                embeds: [embed], 
                components: [row]
            }).catch(console.error);
            btnInt.deferUpdate();
        });

        collector.on('end', async (collection) => {
            leverButton.setDisabled(true);
            embed.setDescription(`${interaction.user} broke the slot machine. Go find another one if you want to keep playing.\n${lastSlotPull}`)
            return interaction.editReply({ 
                embeds: [embed], 
                components: [row] 
            }).catch(console.error);
        });
	},
};
