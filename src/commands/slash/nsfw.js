const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const Booru = require('booru');
const NoDependents = require("../../util/helper_no_dependents.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nsfw')
		.setDescription('Private viewing. Only command sender will be able to see the results.')
        .addStringOption(option => option
            .setName('site')
            .setDescription('Which booru site do you want to look up on?')
            .setRequired(true)
            .addChoices([
                ['rule34','rule34'],
                ['gel','gelbooru'],
                ['yandere','yandere'],
                ['real','realbooru']
            ])
        )
        .addStringOption(option => option
            .setName('tags')
            .setDescription('Can be multiple tags separated by a space. Multi word tags should connect with an "_"')
        ),
	async execute(interaction) {
        const subcommand = interaction.options.getString('site');
        let tagsString = interaction.options.getString('tags');
        
        // Get the tags and weed out the sick fucks
        if(tagsString != null)
        {
            const bannedTags = ['loli', 'shota', 'child'];
            let tagsOK = true;
            bannedTags.forEach(function(tag){
                tagsOK = tagsOK && !tagsString.includes(tag);
            });
            if(!tagsOK)
            {
                return interaction.reply({
                    content: 'No. Just No. I have standards and will not go below them.',
                    ephemeral: true
                });
            }
        }
        else
        {
            tagsString = '';
        }

        const showAnotherHash = NoDependents.GenerateRandomHash(32);
        const showAnotherButton = new MessageButton()
            .setCustomId(showAnotherHash)
            .setLabel('Show Another')
            .setStyle('SUCCESS')
            .setDisabled(false);

        const row = new MessageActionRow()
            .addComponents(
                showAnotherButton
            );

        const posts = (await Booru.search(subcommand, tagsString, { limit: 100, random: true })).posts
        // Check if any posts exists
        if(posts == null || posts.length == 0)
        {
            return interaction.reply({
                content: `Unable to find an image with tags: \`${tagsString}\`.`,
                ephemeral: true
            });
        }

        // Set up buttons for interaction
        const filter = (btnInt) => {
            return btnInt.customId == showAnotherHash;
        }
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60 * 1000,
            max: posts.length - 1
        })

        collector.on('end', () => 
        {
            row.components[0].setDisabled(true);
            return interaction.editReply({
                components: [row]
            }).catch(console.error);
        })

        collector.on('collect', (btnInt) => {
            btnInt.deferUpdate();
            collector.resetTimer();
            const nextpost = posts.pop();
            embed
                .setImage(nextpost.fileUrl)
                .setDescription(`${posts.length} images left in the queue`)
                .setURL(nextpost.fileUrl)

            interaction.editReply({
                embeds: [embed]
            }).catch(console.error);
        });
        const nextpost = posts.pop()
        const embed = new MessageEmbed()
            .setColor('PURPLE')
            .setTitle(`NSFW image from ${subcommand}`)
            .setFooter({ text: `Site: ${subcommand}, Tags: ${tagsString}` })
            .setImage(nextpost.fileUrl)
            .setURL(nextpost.fileUrl)
            .setDescription(`${posts.length} images left in the queue`)

        interaction.reply({
            embeds: [embed],
            ephemeral: true,
            components: [row]
        });
        // Disable all components of a interaction after 10 minutes
        setTimeout(NoDependents.DisableAllInteractionComponents, 10 * 60 * 1000, interaction);
        
	},
};
