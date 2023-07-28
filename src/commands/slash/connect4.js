const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Helper = require("../../util/helper_functions.js");
const NoDependents = require("../../util/helper_no_dependents.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('connect4')
		.setDescription('Play a game of connect 4')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to play against'))
        .setDMPermission(false),
	async execute(interaction) {
        
        const author = interaction.member;
        let guest = interaction.options.getUser("user");
        let authorTurn = Math.random() > 0.5;
        const peices = "🔴🟡";
        let remach = null;
        
        const scoreboard = {}
        scoreboard[author.id] = 0;
        let gameBoard = null;
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Connect 4')
        
        const col1 = NoDependents.GenerateUserHash(interaction.user.id,8);
        const col2 = NoDependents.GenerateUserHash(interaction.user.id,8);
        const col3 = NoDependents.GenerateUserHash(interaction.user.id,8);
        const col4 = NoDependents.GenerateUserHash(interaction.user.id,8);
        const col5 = NoDependents.GenerateUserHash(interaction.user.id,8);
        const col6 = NoDependents.GenerateUserHash(interaction.user.id,8);
        const col7 = NoDependents.GenerateUserHash(interaction.user.id,8);
        const col1Button = new ButtonBuilder()
            .setCustomId(col1)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("1️⃣")
            .setDisabled(false);
        const col2Button = new ButtonBuilder()
            .setCustomId(col2)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("2️⃣")
            .setDisabled(false);
        const col3Button = new ButtonBuilder()
            .setCustomId(col3)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("3️⃣")
            .setDisabled(false);
        const col4Button = new ButtonBuilder()
            .setCustomId(col4)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("4️⃣")
            .setDisabled(false);
        const col5Button = new ButtonBuilder()
            .setCustomId(col5)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("5️⃣")
            .setDisabled(false);
        const col6Button = new ButtonBuilder()
            .setCustomId(col6)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("6️⃣")
            .setDisabled(false);
        const col7Button = new ButtonBuilder()
            .setCustomId(col7)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("7️⃣")
            .setDisabled(false);
        const colHashToColNum = {1: {hash: col1, button: col1Button}, 2: {hash: col2, button: col2Button}, 
        3: {hash: col3, button: col3Button}, 4: {hash: col4, button: col4Button}, 5: {hash: col5, button: col5Button}, 
        6: {hash: col6, button: col6Button}, 7: {hash: col7, button: col7Button}, }
        const gameRow1 = new ActionRowBuilder()
            .addComponents(
                col1Button,
                col2Button,
                col3Button,
                col4Button
            );
        const gameRow2 = new ActionRowBuilder()
            .addComponents(
                col5Button,
                col6Button,
                col7Button
            );

        const rematchHash = NoDependents.GenerateUserHash(interaction.user.id,8);
        const rematchButton = new ButtonBuilder()
            .setCustomId(rematchHash)
            .setLabel('Rematch 0/2')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
            
        function GetGameBoardDisplay()
        {
            output = "1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣"
            for(let i = 0; i < gameBoard.length; i++)
            {
                output += "\n";
                for(let j = 0; j < gameBoard[i].length; j++)
                {
                    output += gameBoard[i][j];
                }
            }
            return output;
        }

        function UpdateEmbed()
        {
            embed.setFields({name: `${author.displayName} 🔴 vs 🟡 ${guest.displayName}`, value: `${(authorTurn) ? author : guest}'s Turn`},
                {name: `Gameboard`, value: GetGameBoardDisplay()})
                .setFooter({text: `${author.displayName}: ${scoreboard[author.id]}\t\t${guest.displayName}: ${scoreboard[guest.id]}`})
        }

        function RestartGame()
        {
            gameBoard = [["🟦","🟦","🟦","🟦","🟦","🟦","🟦"],
                        ["🟦","🟦","🟦","🟦","🟦","🟦","🟦"],
                        ["🟦","🟦","🟦","🟦","🟦","🟦","🟦"],
                        ["🟦","🟦","🟦","🟦","🟦","🟦","🟦"],
                        ["🟦","🟦","🟦","🟦","🟦","🟦","🟦"],
                        ["🟦","🟦","🟦","🟦","🟦","🟦","🟦"]];
            embed.setDescription(null);
        }

        function PlayerMove(player, colHash)
        {
            // Get col number
            let colNum = null;
            for (const [key, value] of Object.entries(colHashToColNum)) 
            {
                if(value.hash == colHash)
                {
                    colNum = parseInt(key);
                    break;
                }
            }

            // Check player can insert and get the index
            let row = null
            for(let gameRow = gameBoard.length - 1; gameRow >= 0; gameRow--)
            {
                if(gameBoard[gameRow][colNum - 1] == "🟦")
                {
                    row = gameRow;
                    break;
                }
            }
            if(row === null)
            {
                return interaction.editReply({content: `An error has occured.`}).catch(console.error);
            }

            // Insert into slot
            gameBoard[row][colNum - 1] = (player == author) ? "🔴" : "🟡";
            
            // Check if winner
            if(NoDependents.CheckLineInMatrix(gameBoard,(player == author) ? "🔴" : "🟡", 4))
            {
                embed.setDescription(`${player} WON`)
                scoreboard[player.id] += 1;
                UpdateEmbed();
                return interaction.editReply({embeds: [embed], components: [new ActionRowBuilder().addComponents(rematchButton)]}).catch(console.error);
            }

            // Check if no more can be inserted into col
            if(row == 0)
            {
                colNum--;
                if(colNum < 4)
                {
                    gameRow1.components[colNum].setDisabled(true);
                }
                else
                {
                    gameRow2.components[colNum % 4].setDisabled(true);
                }
            }

            authorTurn = (player == author) ? false : true
            UpdateEmbed();
            interaction.editReply({embeds: [embed], components: [gameRow1, gameRow2]}).catch(console.error);
        }

        function AwaitUserInput()
        {
            UpdateEmbed();
            interaction.editReply({embeds: [embed], components: [gameRow1, gameRow2]}).catch(console.error);

            const filter = (btnInt) => {
                return btnInt.customId === col1 || btnInt.customId === col2 || btnInt.customId === col3 || btnInt.customId === col4 
                || btnInt.customId === col5 || btnInt.customId === col6 || btnInt.customId === col7 || btnInt.customId === rematchHash;
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
                    if(remach == buttonInt.user)
                    { return buttonInt.reply({ content: `You already said you want to remach`, ephemeral: true }); }

                    if(remach == null)
                    {
                        remach = buttonInt.user;
                        rematchButton.setLabel("Rematch 1/2");
                        embed.setDescription(`${embed.data.description}\n${buttonInt.user} wants to rematch.`)
                        interaction.editReply({embeds: [embed], components: [new ActionRowBuilder().addComponents( rematchButton )]}).catch(console.error);
                    }
                    else
                    {
                        remach = null;
                        rematchButton.setLabel("Rematch 0/2");
                        RestartGame();
                        authorTurn = !authorTurn;
                        UpdateEmbed();
                        interaction.editReply({embeds: [embed], components: [gameRow1, gameRow2]}).catch(console.error);
                    }
                    buttonInt.deferUpdate();
                    return
                }

                if(authorTurn && buttonInt.user.id == author.id)
                {
                    PlayerMove(author, buttonInt.customId)
                }
                else if(!authorTurn && buttonInt.user.id == guest.id)
                {
                    PlayerMove(guest, buttonInt.customId)
                }
                else
                {
                    return buttonInt.reply({ content: `It's not your turn.`, ephemeral: true });
                }

                buttonInt.deferUpdate();
                collector.resetTimer();
            });

            collector.on('end', () => {
                interaction.editReply({components: []}).catch(console.error);
            });
        }

        // Get a user to play against
        if(guest == null)
        {
            embed.setDescription(`${author} wants to play connect 4. Click the button below to play against them.`);
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
                scoreboard[guest.id] = 0;
                RestartGame();
                AwaitUserInput();
            });

            return interaction.reply({embeds: [embed], components: [new ActionRowBuilder().addComponents( joinGameButon )]});
        }
        else
        {
            (async () => {
                const result = await Helper.InteractionGetConfimationFromUser(interaction, guest.id, 60,
                    `Hey ${guest}, ${author} wants to play a game of connect 4. Do you accept?`,
                    `${guest} did not respond to the request from ${author} to play connect 4.`,
                    `${guest} accepted to play connect 4 with ${author}`,
                    `${guest} declined to play connect 4 with ${author}.`)
                if(result)
                {
                    guest = interaction.guild.members.cache.get(guest.id);
                    scoreboard[guest.id] = 0;
                    RestartGame();
                    AwaitUserInput();
                }
            })();
        }
	},
};
