const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const NoDependents = require('../../util/helper_no_dependents.js');
const chrono = require("chrono-node")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timestamp')
		.setDescription('Convert a date and time into a discord timestamp')
		.setDMPermission(true)
        .addStringOption(option => option
            .setName("when")
            .setDescription(`When do you want the timestamp to be set to?`)
            .setRequired(true)),
	async execute(interaction) {
        const input = interaction.options.getString(`when`);
        const time = chrono.parseDate(input);
        const embed = new EmbedBuilder()
            .setTitle('Timestamp')
            .setColor('Random');
        if(!(time instanceof Date)){
            embed.setDescription("Invalid time given. Valid examples: Now, Today, Tomorrow, 5 days ago, 2 weeks from now, Sat Aug 17 2013 18:40:39 GMT+0900 (JST), 2014-11-30T08:15:30-05:30")
            return interaction.reply({embeds: [embed], ephemeral: true});
        }
        function updateEmbed(unixTime)
        {
            const datetime = new Date(unixTime * 1000);
            embed.setTitle(`Discord timestamps for \`${datetime.toUTCString()}\` are:`);
            embed.setFields([{name: `<t:${unixTime}:R>`, value: `\`<t:${unixTime}:R>\``},
                            {name: `<t:${unixTime}:D>`, value: `\`<t:${unixTime}:D>\``, inline: true},
                            {name: `<t:${unixTime}:T>`, value: `\`<t:${unixTime}:T>\``, inline: true},
                            {name: `<t:${unixTime}:F>`, value: `\`<t:${unixTime}:F>\``, inline: true},
                            {name: `<t:${unixTime}:d>`, value: `\`<t:${unixTime}:d>\``, inline: true},
                            {name: `<t:${unixTime}:t>`, value: `\`<t:${unixTime}:t>\``, inline: true},
                            {name: `<t:${unixTime}:f>`, value: `\`<t:${unixTime}:f>\``, inline: true}]);
        }
        let unixTime = parseInt(time.getTime()/1000);
        embed.setFooter({text: "Got the timezone wrong? Use the buttons below to add or subtract an hour."})

        const addHourHash = NoDependents.GenerateUserHash(interaction.user.id,8);
        const subHourHash = NoDependents.GenerateUserHash(interaction.user.id,8);
        const addHourButton = new ButtonBuilder()
            .setCustomId(addHourHash)
            .setLabel('+1')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
        const subHourButton = new ButtonBuilder()
            .setCustomId(subHourHash)
            .setLabel('-1')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false);
        const buttonRow = new ActionRowBuilder()
            .addComponents(subHourButton, addHourButton);
        
        const filter = (btnInt) => {
            return btnInt.customId === addHourHash || btnInt.customId === subHourHash;
        }
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60 * 1000,
            ComponentType: ComponentType.Button
        });
        setTimeout(function(){ collector.stop() }, 10 * 60 * 1000);

        collector.on('end', () => {
            for(let button of buttonRow.components){ button.setDisabled(true); }
            interaction.editReply({components: [buttonRow]}).catch(console.error);
        });

        collector.on('collect', buttonInt => {
            if(buttonInt.user.id !== interaction.user.id)
            {
                return buttonInt.reply({ content: `These buttons aren't for you.`, ephemeral: true });
            }
            
            buttonInt.deferUpdate();
            
            collector.resetTimer();
            if(buttonInt.customId == addHourHash)
            {
                unixTime += 3600;
            }
            else
            {
                unixTime -= 3600;
            }
            updateEmbed(unixTime)
            interaction.editReply({embeds: [embed], components: [buttonRow], ephemeral: true}).catch(console.error);
        });

        updateEmbed(unixTime);
		return interaction.reply({embeds: [embed], components: [buttonRow], ephemeral: true});
	},
};
