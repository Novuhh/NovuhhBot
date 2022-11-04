const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const NoDependents = require("../../util/helper_no_dependents.js");
const Data = require("../../util/user_data.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('votekick')
		.setDescription('Call for a votekick of someone in a voice channel')
        .addUserOption(option => option 
            .setName('user')
            .setDescription('Person to call votekick on')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why are you wanting to kick this person')),
	async execute(interaction) {

        const votekickee = interaction.options.getUser('user');
        const votekickeeVoiceState = interaction.guild.members.cache.get(votekickee.id).voice;
        const voiceChannel = votekickeeVoiceState.channel;

        if(votekickee == interaction.user)
        {
            return interaction.reply(`**Vote kick failed**\nYou can't call for a votekick on yourself. Just disconnect dumbass.`);
        }
        if(!votekickeeVoiceState.channel)
        {
            return interaction.reply({content: `**Vote kick failed**\n${votekickee} is not in a voice channel.`, allowedMentions: { repliedUser: false }});
        }
        if(interaction.member.voice.channel == null || votekickeeVoiceState.channel.id != interaction.member.voice.channel.id)
        {
            return interaction.reply({content: `**Vote kick failed**\n${votekickee} is not in the voice channel you are in.`, allowedMentions: { repliedUser: false }});
        }

        let reason = interaction.options.getString('reason');
        if(reason == null) { reason = 'No reason given'; }
        let voteToKick = [interaction.user.id];
        let voteToStay = [votekickee.id];
        const embed = new MessageEmbed()
            .setColor('PURPLE')
            .setTitle(`Vote Kick Called`)
            .setDescription(`${interaction.user} called for a vote kick on ${votekickee} with reason listed: \`${reason}\``)
            .setFooter({ text: `${voteToKick.length} Vote to kick - ${voteToStay.length} vote to not kick` })

        async function UpdateCount()
        {
            const voiceChannelMemberIDs = Array.from(voiceChannel.members.keys());

            // Update and verify people who have already voted are still in the voice channel
            for(let i = 0; i < voteToKick.length; i++)
            {
                if(!voiceChannelMemberIDs.includes(voteToKick[i]))
                {
                    voteToKick.splice(i,1);
                }
            }
            for(let i = 0; i < voteToStay.length; i++)
            {
                if(!voiceChannelMemberIDs.includes(voteToStay[i]))
                {
                    voteToStay.splice(i,1);
                }
            }

            embed.setFooter({ text: `${voteToKick.length} Vote to kick - ${voteToStay.length} vote to not kick` })
            await interaction.editReply({ 
            embeds: [embed],
                components: [row] 
            }).catch(console.error);
        }

        const kickHash = NoDependents.GenerateRandomHash(32);
        const noKickHash = NoDependents.GenerateRandomHash(32);
        const kickButton = new MessageButton()
            .setCustomId(kickHash)
            .setLabel('Accept')
            .setStyle('SUCCESS')
            .setDisabled(false);
        const noKickButton = new MessageButton()
            .setCustomId(noKickHash)
            .setLabel('Decline')
            .setStyle('DANGER')
            .setDisabled(false);
        const row = new MessageActionRow()
            .addComponents(
                kickButton,
                noKickButton
            );

        const filter = (btnInt) => {
            return btnInt.customId == kickHash || btnInt.customId == noKickHash;
        }
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60 * 1000
        })

        collector.on('collect', buttonInt => {
            UpdateCount();

            //Handle people who are not in the voice chat
            const voiceChannelMemberIDs = Array.from(voiceChannel.members.keys());
            if(!voiceChannelMemberIDs.includes(buttonInt.user.id))
            {
                return buttonInt.reply({ content: `You need to be in the voice channel to vote.`, ephemeral: true });
            }
            
            // Handle people who have already voted
            if(voteToKick.includes(buttonInt.user.id))
            {
                return buttonInt.reply({ content: `You have already voted to \`kick\` ${votekickee}.`, ephemeral: true });
            }
            if(voteToStay.includes(buttonInt.user.id))
            {
                return buttonInt.reply({ content: `You have already voted to \`not kick\` ${votekickee}.`, ephemeral: true });
            }

            if(buttonInt.customId == kickHash)
            {
                voteToKick.push(buttonInt.user.id)
                buttonInt.deferUpdate();
            }
            else
            {
                voteToStay.push(buttonInt.user.id)
                buttonInt.deferUpdate();
            }

            if(voteToKick.length > Math.ceil(voiceChannel.members.size / 2.0))
            {
                embed.setTitle('Vote Kick Passed');
                kickButton.setDisabled(true);
                noKickButton.setDisabled(true);
                votekickeeVoiceState.disconnect();
                Data.VoteKick.AddVoteKicked(votekickee.id, voiceChannel.id)
                setTimeout(Data.VoteKick.RemoveVoteKicked, 10 * 60 * 1000, [votekickee.id, voiceChannel.id])
            }

            if(voteToStay.length > Math.ceil(voiceChannel.members.size / 2.0))
            {
                embed.setTitle('Vote Kick Failed');
                kickButton.setDisabled(true);
                noKickButton.setDisabled(true);
            }

            embed.setFooter({ text: `${voteToKick.length} Vote to kick - ${voteToStay.length} vote to not kick` })
            interaction.editReply({ 
            embeds: [embed],
                components: [row] 
            }).catch(console.error);

        });

        collector.on('end', async () => {
            if(embed.title == 'Vote Kick Passed' || embed.title == 'Vote Kick Failed'){ return; }

            embed.setTitle('Vote Kick Failed - Timeout');
            kickButton.setDisabled(true);
            noKickButton.setDisabled(true);

            interaction.editReply({ 
                embeds: [embed],
                components: [row] 
            }).catch(console.error);
        });

        interaction.reply({
            embeds: [embed],
            components: [row]
        });
	},
};
