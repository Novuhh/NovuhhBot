const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle,  } = require('discord.js');
const Data = require("../../util/user_data.js")
const Helper = require('../../util/helper_functions.js');
const NoDependents = require('../../util/helper_no_dependents.js');
const { payRetire, payManager, payWorker, workerCredPenalty, payFastFood, gamblerPulls, gamblerBet, payGarbage, payCollector, beggerAmount, beggerPeople } = require('../../data/constants.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('work')
		.setDescription('Stop being poor and get a job')
        .addStringOption(option => 
            option.setName('job')
            .setDescription('The job you want to work.')
            .addChoices(
                {name: "Retired", value: "retired"},
                {name: "Office_Manager", value: "officeManager"},
                {name: "Office_Worker", value: "officeWorker"},
                {name: "Fast_Food_Worker", value: "fastFood"},
                {name: "Gambler", value: "gamba"},
                {name: "Garbage_Man", value: "garbage"},
                {name: "Shit_Collector", value: "shitCollector"},
                {name: "Begger", value: "begger"}
            )
        ),
	async execute(interaction) {
        const guildSocialCred = new Data.SocialCredit(interaction.guildId);
        
        const job = interaction.options.getString('job');
        const user = interaction.user;
        const cred = guildSocialCred.GetSocialCreditOfUser(user.id);
        const embed = new EmbedBuilder().setColor('Green');

        if(!job)
        {
            let jobMessage = ``;
            if(cred >= 2000)
                jobMessage += `\n⛳2000 : Retired - You don't need to work, you can just collect of your social security for the rest of your life.`;
            if(cred >= 1500)
                jobMessage += `\n🏢1500 : Office Manager - King of the 9-5 plebs, boss them around to do your work.`;
            if(cred >= 1000)
                jobMessage += `\n🕘1000 : Office Worker - The modern day slave to corporations. Maybe one day you will be promoted.`;
            if(cred >= 750)
                jobMessage += `\n🍔750 : Fast Food Worker - Just give me my burger you fuckin bitch.`;
            if(cred >= 500)
                jobMessage += `\n🎰500 : Gambler - Some people are addicted to gambling, not you its your job.`;
            if(cred >= 250)
                jobMessage += `\n♻️250 : Garbage Man - You may not have the best job but at least you aren't picking up shit.`;
            if(cred >= 0)
                jobMessage += `\n💩 0  : Shit collector - You have the worst job. You are a literal shit collector.`;
            jobMessage += `\n🙏Any : Begger - No job havin ass needs to beg for any coin you can get.`;
            embed.setTitle(`Time to get to Work`)
                .setDescription(`Your job opputunities are dependent on your social credit. Minium social credit needed on the left, job on the right.`)
                .addField('Job Opputunities', jobMessage);
            return interaction.reply({embeds: [embed]});
        }

        if(Data.Bitfield.GetUserWorkedStatus(user.id))
        {
            embed.setDescription(`You already worked today and need to wait until tomorrow to work again.`)
            return interaction.reply({embeds: [embed]});
        }

        switch(job)
        {
            case "retired":
            {
                if(2000 > cred)
                {
                    embed.setColor('Red').setDescription('You don\'t have enough social credit to retire.');
                    return interaction.reply({embeds: [embed]});
                }
                Data.Bitfield.SetUserWorkedStatus(user.id, true);
                Data.Coin.ChangeCoinOfUserByAmount(user.id, payRetire);
                embed.setDescription(`You've worked all your life and now it's time to cash in on that welfare money for easy coin. Take your \`${payRetire}\` coin and go play some golf or something else old people do.`);
                return interaction.reply({embeds: [embed]});
            }

            case "officeManager":
            {
                if(1500 > cred)
                {
                    embed.setColor('Red').setDescription('You don\'t have enough social credit work to as a office manager.');
                    return interaction.reply({embeds: [embed]});
                }

                Data.Bitfield.SetUserWorkedManagerStatus(user.id, true);
                Data.Coin.ChangeCoinOfUserByAmount(user.id, payManager);
                embed.setDescription(`You get an intial pay of \`${payManager}\` coin + \`50\` coin per office worker that worked at the end of the day.`);
                return interaction.reply({embeds: [embed]})
            }

            case "officeWorker":
            {
                if(1000 > cred)
                {
                    embed.setColor('Red').setDescription('You don\'t have enough social credit work to as a office worker.');
                    return interaction.reply({embeds: [embed]});
                }
                Data.Bitfield.SetUserWorkedStatus(user.id, true);

                const eightHours = 8 * 60 * 60 * 1000;
                const hash = NoDependents.GenerateUserHash(interaction.user.id);
                setTimeout(function() {
                    const hereButton = new ButtonBuilder()
                        .setCustomId(hash)
                        .setLabel('I\'m Here Working')
                        .setEmoji('🏃')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(false);
                    const row = new ActionRowBuilder().addComponents(hereButton);

                    const filter = (btnInt) => { return btnInt.customId == hash; }
                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        time: 60 * 1000
                    })

                    embed.setDescription(`Hey ${user}, Your shift is over and your boss is on his way to your cubicle right now. If you aren't in there in the next minute he's going to know you acutally didn't do any work. You better run.`);
                    interaction.channel.send({
                        content: `${user}`,
                        embeds: [embed],
                        components: [row]
                    }).then(message => {
                        let pressedButton = false;
                        collector.on('collect', (btnInt) => {
                            if(interaction.user.id != btnInt.user.id)
                            {
                                return  btnInt.reply({
                                    content: `This button isn't for you.`,
                                    ephemeral: true
                                });
                            }
                            pressedButton = true;
                            Data.Work.IncrementWorkersWorker();
                            Data.Coin.ChangeCoinOfUserByAmount(user.id, payWorker);
                            embed.setDescription(`Good to see you are still here doing your job \`${user.username}\`. Your shift is over, you can go home with your paycheck of \`${payWorker}\` coin.`);
                            message.edit({
                                embeds: [embed],
                                components: []
                            });
                            btnInt.deferUpdate();
                        });

                        collector.on('end', async () => {
                            if(!pressedButton){
                                guildSocialCred.ChangeSocialCreditOfUserByAmount(interaction.member, -workerCredPenalty, interaction);
                                embed.setColor('Red').setDescription(`You think I wouldn't notice that you hadn't done any work? Well \`${user.username}\`, I hope whatever you did instead of working was worth losing \`${workerCredPenalty}\` social credit.`);
                                return message.edit({
                                    embeds: [embed],
                                    components: []
                                });
                            }
                        });
                    });
                }, eightHours);

                embed.setDescription(`Get to work you wage slave. You will get paid when you finish your 8 hour shift.`);
                return interaction.reply({embeds: [embed]});
            }

            case "fastFood":
            {
                if(750 > cred)
                {
                    embed.setColor('Red').setDescription('You don\'t have enough social credit work to as a fast food worker.');
                    return interaction.reply({embeds: [embed]});
                }
                Data.Bitfield.SetUserWorkedStatus(user.id, true);

                // List of potential scammbled phrases
                const potentialWords = ['cheese','ketchup','mustard','onions','lettuce','tomato','fries','bitches', 'cum',
                'mayonnaise','bacon','bbq sauce','grilled onions','pickles','jalapenos','potato chips','pulled pork'];

                // Get the random phrase and shuffle it
                const selectedPharse = potentialWords[Math.floor(Math.random() * potentialWords.length)];
                let words = selectedPharse.split(' ');
                for(i = 0; i < words.length; i++)
                    words[i] = NoDependents.ShuffleArray(words[i].split('')).join('');
                const scrambledPhrase = words.join(' ');

                embed.setDescription(`**Customer**:Alright borger bitch, I'll order with a borger with extra \`${scrambledPhrase}\`.\nWhat extra thing did the cusomer want with their borger.`);
                interaction.reply({embeds: [embed]});

                const filter = msg => msg.author.id == user.id;
                const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 10000 });
        
                collector.on('end', collected => {
                    if(collected.first() == null)
                    {
                        embed.setColor('Red').setDescription(`What are you doing just staring at the register. The customer wanted extra \`${selectedPharse}\`. If you don't wanna work just leave.`);
                        return interaction.editReply({embeds: [embed]}).catch(console.error);
                    }
                    else if(collected.first().content.toLowerCase() == selectedPharse)
                    {
                        Data.Coin.ChangeCoinOfUserByAmount(user.id, payFastFood);
                        embed.setDescription(`You understood that guy? Well I guess we don't pay you for nothing. Take your \`${payFastFood}\` coins and go home.`);
                        return interaction.editReply({embeds: [embed]}).catch(console.error);
                    }
                    else
                    {
                        embed.setColor('Red').setDescription(`You stupid ass borger bitch can't even get a customer's order correct. They wanted extra \`${selectedPharse}\`.`);
                        return interaction.editReply({embeds: [embed]}).catch(console.error);
                    }
                });

                return;
            }

            case "gamba":
            {
                if(500 > cred)
                {
                    embed.setColor('Red').setDescription('You don\'t have enough social credit work to as a gambler.');
                    return interaction.reply({embeds: [embed]});
                }                
                Data.Bitfield.SetUserWorkedStatus(user.id, true);

                let winnings = 0;
                let pullNumber = 0;
                embed.setDescription(`Enjoy your \`${gamblerPulls}\` government subsidized slot machine pulls with a bet of \`${gamblerBet}\`.\n${Helper.Slots()[0]}You've won: ${winnings}\nPull number: ${pullNumber}`);
                interaction.reply(({embeds: [embed]}));

                for(i = 0; i < gamblerPulls; i++)
                {
                    setTimeout(function() {
                        Data.Coin.ChangeCoinOfUserByAmount(user.id, gamblerBet)
                        const slotPull = Helper.Slots(user.id, gamblerBet)
                        pullNumber += 1;
                        winnings += slotPull[1]
                        embed.setDescription(`Enjoy your \`${gamblerPulls}\` government subsidized slot machine pulls with a bet of \`${gamblerBet}\`.\n${slotPull[0]}You've won: ${winnings}\nPull number: ${pullNumber}`);
                        interaction.editReply({embeds: [embed]}).catch(console.error);
                    }, 2500 * (i + 1));
                }
                return;
            }

            case "garbage":
            {
                if(250 > cred)
                {
                    embed.setColor('Red').setDescription('You don\'t have enough social credit work to as a garbage man.');
                    return interaction.reply({embeds: [embed]});
                }

                Data.Bitfield.SetUserWorkedStatus(user.id, true);
                const safe = ['⬛','⬛','⬛','⬛','⬛','⬛','⬛','⬛','⬛','⬛','🤼‍♂️','🚴','🚶‍♂️','🚲','🚓','🏠','🏠','⚽','🏈'];
                const pickup = ['🗑️','🚬','📃'];
                const squareSideSize = 10
                const numberOfTrash = Math.floor(Math.random() * 10) + 5
                // Initalize array
                var array = []
                for(i = 0; i < squareSideSize*squareSideSize; i++) 
                    array[i]=i;
                array = NoDependents.ShuffleArray(array)
                                
                // Output array
                let trashMatrix = ``;
                for(i = 0; i < squareSideSize*squareSideSize; i++)
                {
                    if(array[i] - numberOfTrash < 0)
                        trashMatrix += pickup[Math.floor(Math.random() * pickup.length)];
                    else 
                        trashMatrix += safe[Math.floor(Math.random() * safe.length)];
                    if((i % squareSideSize) == squareSideSize - 1)
                        trashMatrix += '\n';
                }

                embed.setDescription(`Pickup all of the ${pickup.join(`, `)}\n${trashMatrix}`);
                interaction.reply({embeds: [embed]}).then(() =>{setTimeout(function(){
                    embed.setDescription(`How much trash did you clean up? Just type the number here.`);
                    interaction.editReply({embeds: [embed]}).catch(console.error);

                    const filter = msg => msg.author.id == user.id;
                    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 10000 });
            
                    collector.on('end', collected => {
                        if(collected.first() == null)
                        {
                            embed.setColor('Red').setDescription(`So you show up to work and then don't actually work? You should have picked up \`${numberOfTrash}\` pieces of trash.`);
                            return interaction.editReply({embeds: [embed]}).catch(console.error);
                        }
                        else if(collected.first().content == numberOfTrash)
                        {
                            Data.Coin.ChangeCoinOfUserByAmount(user.id, payGarbage);
                            embed.setDescription(`Good to see you aren't a worthless garbage man. You got paid \`${payGarbage}\` coin for cleaning up all that trash.`);
                            return interaction.editReply({embeds: [embed]}).catch(console.error);
                        }
                        else
                        {
                            embed.setColor('Red').setDescription(`I can see why you are a garbage man. You can't even pick up trash properly. You should have picked up \`${numberOfTrash}\`. Look at how badly you fucked up.\n${trashMatrix}`);
                            return interaction.editReply({embeds: [embed]}).catch(console.error);
                        }
                    });
                }, 5000)});
                return;
            }

            case "shitCollector":
            {
                if(0 > cred)
                {
                    embed.setColor('Red').setDescription('You don\'t have enough social credit work to as a shit collector.')
                    return interaction.reply({embeds: [embed]});
                }
                Data.Bitfield.SetUserWorkedStatus(user.id, true);

                const squareSideSize = 8
                const numberOfShits = Math.ceil(Math.random() * 4) + 3
                // Initalize array
                var array = []
                for(i = 0; i < squareSideSize*squareSideSize; i++) 
                    array[i]=i;
                array = NoDependents.ShuffleArray(array)
                    
                // Output array
                let shitMatrix = ``;
                for(i = 0; i < squareSideSize*squareSideSize; i++)
                {
                    if(array[i] - numberOfShits < 0)
                        shitMatrix += '💩';
                    else 
                        shitMatrix += '🟫';
                    if((i % squareSideSize) == squareSideSize - 1)
                        shitMatrix += '\n';
                }

                embed.setDescription(shitMatrix);
                interaction.reply({embeds: [embed]}).then(sent =>{setTimeout(function(){
                    embed.setDescription(`How much shit did you pick up? Just type the number here.`)
                    interaction.editReply({embeds: [embed]}).catch(console.error);

                    const filter = msg => msg.author.id == user.id;
                    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 10000 });
            
                    collector.on('end', collected => {
                        if(collected.first() == null)
                        {
                            embed.setColor('Red').setDescription(`So you show up to work and then don't actually work?`);
                            return interaction.editReply({embeds: [embed]}).catch(console.error);
                        }
                        else if(collected.first().content == numberOfShits)
                        {
                            Data.Coin.ChangeCoinOfUserByAmount(user.id, payCollector);
                            embed.setDescription(`Good job shit collector. You got paid \`${payCollector}\` coin for dealing with that shit.`)
                            return interaction.editReply({embeds: [embed]}).catch(console.error);
                        }
                        else
                        {
                            embed.setColor('Red').setDescription(`Not only are you a shit collector. You are a useless shit collector. You should have picked up \`${numberOfShits}\` piles of shits. Look at how badly you fucked up.\n${shitMatrix}`);
                            return interaction.editReply({embeds: [embed]}).catch(console.error);
                        }
                    });
                }, 1000)});
                return;
            }

            case "begger":
            {
                Data.Bitfield.SetUserWorkedStatus(user.id, true);
                const people = NoDependents.RollDie(beggerPeople);
                const donation = NoDependents.RollDice(people, beggerAmount);
                Data.Coin.ChangeCoinOfUserByAmount(user.id, donation);
                embed.setDescription(`Please sir or madam a penny for the poor?\n\`${people}\` people gave you a total of \`${donation}\` coin to make you shut up.`);
                return interaction.reply({embeds: [embed]});
            }
        }
	},
};
