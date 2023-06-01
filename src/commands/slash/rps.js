const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Helper = require("../../util/helper_functions.js");
const NoDependents = require("../../util/helper_no_dependents.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rps')
		.setDescription('Play a game of rock paper scissor')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to play against'))
        .setDMPermission(false),
	async execute(interaction) {
        
        const author = interaction.member;
        let guest = interaction.options.getUser("user");
        
        const scoreboard = {}
        const moves = {}
        const moveNumToEmoji = {1: "🪨", 2: "📰", 3: "✂️"}

        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Rock, Paper, Scissors')
        
        const rockHash = NoDependents.GenerateUserHash(interaction.user.id,8);
        const paperHash = NoDependents.GenerateUserHash(interaction.user.id,8);
        const scissorHash = NoDependents.GenerateUserHash(interaction.user.id,8);
        const rockButton = new ButtonBuilder()
            .setCustomId(rockHash)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🪨")
            .setDisabled(false);
        const paperButton = new ButtonBuilder()
            .setCustomId(paperHash)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📰")
            .setDisabled(false);
        const scissorButton = new ButtonBuilder()
            .setCustomId(scissorHash)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✂️')
            .setDisabled(false);
        const gameRow = new ActionRowBuilder()
            .addComponents(
                rockButton,
                paperButton,
                scissorButton
            );

        const rematchHash = NoDependents.GenerateUserHash(interaction.user.id,8);
        const rematchButton = new ButtonBuilder()
            .setCustomId(rematchHash)
            .setLabel('Rematch 0/2')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
        //const rematchRow = new ActionRowBuilder().addComponents( rematchButton );
        
        function StartGame()
        {
            scoreboard[author.id] = 0;
            scoreboard[guest.id] = 0;

            moves[author.id] = null;
            moves[guest.id] = null;
            AwaitUserInput();
        }
        
        // Set up game
        function AwaitUserInput()
        {
            embed.setDescription(null)
                .addFields({name: `${author.displayName}'s Score:`, value: ''+scoreboard[author.id], inline: true})
                .addFields({name: `${guest.displayName}'s Score:`, value: ''+scoreboard[guest.id], inline: true})
                .addFields({name: `${author.displayName}`, value: '❌ Not Ready'})
                .addFields({name: `${guest.displayName}`, value: '❌ Not Ready', inline: true});
            interaction.editReply({embeds: [embed], components: [gameRow]}).catch(console.error);
            
            const filter = (btnInt) => {
                return btnInt.customId === rockHash || btnInt.customId === paperHash || btnInt.customId === scissorHash || btnInt.customId === rematchHash;
            }
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: 30 * 1000,
                ComponentType: ComponentType.Button
            });
            setTimeout(() => { collector.stop();
                interaction.editReply({components: []}).catch(console.error)
                }, 10 * 60 * 1000);
            collector.on('collect', buttonInt => {
                if(!(buttonInt.user.id === author.id || buttonInt.user.id === guest.id))
                {
                    return buttonInt.reply({ content: `These buttons aren't for you.`, ephemeral: true });
                }
                
                if(buttonInt.customId === rematchHash)
                {
                    if(moves[buttonInt.user.id] != null) { moves[buttonInt.user.id] = null; }
                    else { return buttonInt.reply({ content: `You already said you want to remach`, ephemeral: true }); }
                
                    if(moves[author.id] == null && moves[guest.id] == null)
                    {
                        rematchButton.setLabel("Rematch 0/2");
                        embed.data.fields[2].value = '❌ Not Ready';
                        embed.data.fields[3].value = '❌ Not Ready';
                        embed.setDescription(null);
                        interaction.editReply({embeds: [embed], components: [gameRow]}).catch(console.error);
                    }
                    else
                    {   
                        rematchButton.setLabel("Rematch 1/2");
                        interaction.editReply({components: [new ActionRowBuilder().addComponents( rematchButton )]}).catch(console.error);
                    }
                    buttonInt.deferUpdate();
                    return;
                }

                if(buttonInt.user.id === author.id)
                {
                    if(moves[author.id] == null)
                    {
                        embed.data.fields[2].value = "✅ Ready";
                        interaction.editReply({embeds: [embed]}).catch(console.error);
                    }
                    else
                    {
                        return buttonInt.reply({ content: `You already made your move`, ephemeral: true });
                    }
                }
                if(buttonInt.user.id === guest.id)
                {
                    if(moves[guest.id] == null)
                    {
                        embed.data.fields[3].value = "✅ Ready";
                        interaction.editReply({embeds: [embed]}).catch(console.error);
                    }
                    else
                    {
                        return buttonInt.reply({ content: `You already made your move`, ephemeral: true });
                    }
                }

                buttonInt.deferUpdate();
                collector.resetTimer();

                switch(buttonInt.customId)
                {
                    case rockHash:
                    {
                        if(buttonInt.user.id == interaction.user.id) { moves[author.id] = 1; }
                        else { moves[guest.id] = 1; }
                        CheckResult();
                        return;
                    }
    
                    case paperHash:
                    {
                        if(buttonInt.user.id == interaction.user.id) { moves[author.id] = 2; }
                        else{ moves[guest.id] = 2; }
                        CheckResult();
                        return;
                    }

                    case scissorHash:
                    {
                        if(buttonInt.user.id == interaction.user.id) { moves[author.id] = 3; }
                        else { moves[guest.id] = 3; }
                        CheckResult();
                        return;
                    }
                }
            });
        }

        function CheckResult()
        {
            if(moves[author.id] == null || moves[guest.id] == null)
            {
                return;
            }
            // Draw
            if(moves[author.id] == moves[guest.id])
            {
                embed.setDescription("Draw");
            }

            // Author wins
            else if((moves[author.id] == 1 && moves[guest.id] == 3) || (moves[author.id] == 2 && moves[guest.id] == 1) || (moves[author.id] == 3 && moves[guest.id] == 2))
            {
                embed.setDescription(`${author} WINS`);
                scoreboard[author.id] += 1;
                embed.data.fields[0].value = scoreboard[author.id];
            }
            
            // guest wins
            else
            {
                embed.setDescription(`${guest} WINS`);
                scoreboard[guest.id] += 1;
                embed.data.fields[1].value = scoreboard[guest.id];
            }

            embed.data.fields[2].value = moveNumToEmoji[moves[author.id]];
            embed.data.fields[3].value = moveNumToEmoji[moves[guest.id]];
            interaction.editReply({embeds: [embed], components: [new ActionRowBuilder().addComponents( rematchButton )]}).catch(console.error);
        }

        // Get a user to play against
        if(guest == null)
        {
            embed.setDescription(`${author} wants to play RPS. Click the button below to play against them.`);
            const joinGameHash = NoDependents.GenerateUserHash(interaction.user.id,8);
            const joinGameButon = new ButtonBuilder()
                .setCustomId(joinGameHash)
                .setLabel("Join Game")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false);

            const filter = (btnInt) => { return btnInt.customId === joinGameHash; }
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: 30 * 1000,
                ComponentType: ComponentType.Button
            });
            setTimeout(function(){ collector.stop() }, 1 * 60 * 1000);
            collector.on('collect', buttonInt => {
                if(buttonInt.user.id === interaction.user.id)
                {
                    return buttonInt.reply({ content: `You are already in the game waiting for someone else to join.`, ephemeral: true });
                }
                buttonInt.deferUpdate();
                collector.stop();
                guest = buttonInt.member;
                StartGame();
            });

            return interaction.reply({embeds: [embed], components: [new ActionRowBuilder().addComponents( joinGameButon )]});
        }
        else
        {
            (async () => {
                const result = await Helper.InteractionGetConfimationFromUser(interaction, guest.id, 60,
                    `Hey ${guest}, ${author} wants to play a game of rock paper scissors. Do you accept?`,
                    `${guest} did not respond to the request from ${author} to play rock paper scissors.`,
                    `${guest} accepted to play rock paper scissors with ${author}`,
                    `${guest} declined to play rock paper scissors with ${author}.`)
                if(result)
                {
                    guest = interaction.guild.members.cache.get(guest.id);
                    StartGame();
                }
            })()
        }


	},
};
