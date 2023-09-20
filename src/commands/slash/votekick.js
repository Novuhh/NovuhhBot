const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const NoDependents = require("../../util/helper_no_dependents.js");
const Data = require("../../util/user_data.js");
const { votekickTimeoutMinutes } = require('../../data/constants.json');

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
            .setDescription('Why are you wanting to kick this person'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Speak),
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
        let voteToKick = [];//[interaction.user.id];
        let voteToStay = [];//[votekickee.id];
        let voteToAbstain = [];
        const embed = new EmbedBuilder()
            .setColor('Purple')
            .setTitle(`Vote Kick Called`)
            .setDescription(`${interaction.user} wants to kick ${votekickee} from \`${voiceChannel.name}\` with reason listed: \`${reason}\``)
            .setFooter({ text: `${voteToKick.length} Vote to kick - ${voteToStay.length} vote to not kick - ${voteToAbstain.length} vote to abstain` });

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
            for(let i = 0; i < voteToAbstain.length; i++)
            {
                if(!voiceChannelMemberIDs.includes(voteToAbstain[i]))
                {
                    voteToAbstain.splice(i,1);
                }
            }

            UpdateFooter();
        }

        function UpdateFooter()
        {
            embed.setFooter({ text: `${voteToKick.length} Vote to kick - ${voteToStay.length} vote to not kick - ${voteToAbstain.length} vote to abstain` })
        }

        const kickHash = NoDependents.GenerateUserHash(interaction.user.id);
        const noKickHash = NoDependents.GenerateUserHash(interaction.user.id);
        const abstainHash = NoDependents.GenerateUserHash(interaction.user.id);
        const kickButton = new ButtonBuilder()
            .setCustomId(kickHash)
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
        const noKickButton = new ButtonBuilder()
            .setCustomId(noKickHash)
            .setLabel('Decline')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false);
        const abstainButton = new ButtonBuilder()
            .setCustomId(abstainHash)
            .setLabel('Abstain')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);
        const row = new ActionRowBuilder()
            .addComponents(
                kickButton,
                noKickButton,
                abstainButton
            );

        const filter = (btnInt) => {
            return btnInt.customId == kickHash || btnInt.customId == noKickHash || btnInt.customId == abstainHash;
        }
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60 * 1000
        })

        var voteEnded = false;
        collector.on('collect', async buttonInt => {
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
            if(voteToAbstain.includes(buttonInt.user.id))
            {
                return buttonInt.reply({ content: `You have already voted to \`abstain\` ${votekickee}.`, ephemeral: true });
            }

            if(buttonInt.customId == kickHash)
            {
                voteToKick.push(buttonInt.user.id)
                buttonInt.deferUpdate();
            }
            else if (buttonInt.customId == noKickHash)
            {
                voteToStay.push(buttonInt.user.id)
                buttonInt.deferUpdate();
            }
            else
            {
                voteToAbstain.push(buttonInt.user.id)
                buttonInt.deferUpdate();
            }

            if(voteToKick.length > Math.ceil((voiceChannel.members.size - voteToAbstain.length) / 2.0))
            {
                embed.setTitle('Vote Kick Passed');
                kickButton.setDisabled(true);
                noKickButton.setDisabled(true);
                abstainButton.setDisabled(true);
                votekickeeVoiceState.disconnect();
                const timeoutExpires = Date.now() +(votekickTimeoutMinutes * 60 * 1000);
                Data.VoteKick.AddVoteKicked(votekickee.id, voiceChannel.id, timeoutExpires);
                voteEnded = true;
            }

            if(voteToStay.length > Math.ceil((voiceChannel.members.size - voteToAbstain.length) / 2.0))
            {
                embed.setTitle('Vote Kick Failed');
                kickButton.setDisabled(true);
                noKickButton.setDisabled(true);
                abstainButton.setDisabled(true);
                voteEnded = true;
            }

            UpdateFooter();
            interaction.editReply({ 
                embeds: [embed],
                components: [row] 
            }).catch(console.error);

        });

        collector.on('end', async () => {
            kickButton.setDisabled(true);
            noKickButton.setDisabled(true);
            abstainButton.setDisabled(true);

            if(voteEnded){ return; }

            // All non voters count as abstain
            if(voteToKick.length > voteToStay.length)
            {
                embed.setTitle('Vote Kick Passed');
                votekickeeVoiceState.disconnect();
                const timeoutExpires = Date.now() +(votekickTimeoutMinutes * 60 * 1000);
                Data.VoteKick.AddVoteKicked(votekickee.id, voiceChannel.id, timeoutExpires);
            }
            else
            {
                embed.setTitle('Vote Kick Failed - Timeout');
            }

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
