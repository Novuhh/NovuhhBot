const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const Data = require("../../util/user_data.js")
const Helper = require("../../util/helper_functions.js");
const NoDependents = require("../../util/helper_no_dependents.js");
const { minWaifuValue, maxWaifuValue, gagMaxTime, minSocialCredit, pimpValuePerDie } = require('../../data/constants.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('waifu')
		.setDescription('Slavery is pog.')
        .addSubcommand(subCommand => subCommand
            .setName('info')
            .setDescription('Get the info about a user.')
            .addUserOption(option => option
                .setName('target')
                .setDescription('The target you want to get the infomation about.')))
        .addSubcommand(subCommand => subCommand
            .setName('market')
            .setDescription('See who is able to be claimed on the waifu market.'))
        .addSubcommand(subCommand => subCommand
            .setName('value')
            .setDescription('Set the waifu claim value of yourself.')
            .addIntegerOption(option => option
                .setName('value')
                .setDescription('The value to set your price as.')
                .setMinValue(0)
                .setMaxValue(maxWaifuValue)
                .setRequired(true)))
        .addSubcommand(subCommand => subCommand
            .setName('submit')
            .setDescription('Submit yourself to someone.')
            .addUserOption(option => option
                .setName('your_new_owner')
                .setDescription('The user who you are submitting to and will become your owner.')
                .setRequired(true))
            .addIntegerOption(option => option
                .setName('value')
                .setDescription('Your value as a waifu if the offer is accepted.')
                .setMinValue(minWaifuValue)
                .setMaxValue(maxWaifuValue)
                .setRequired(true)))
        .addSubcommand(subCommand => subCommand
            .setName('buy_freedom')
                .setDescription('Attempt to buy back your freedom from your owner.')
                .addIntegerOption(option => option
                    .setName('offer')
                    .setDescription('How much cred you are offering to have your freedom back.')
                    .setMinValue(minWaifuValue)
                    .setMaxValue(maxWaifuValue * 2)
                    .setRequired(true)))
        .addSubcommand(subCommand => subCommand
            .setName('claim')
            .setDescription('Claim someone else as your property.')
                .addUserOption(user => user
                .setName('target')
                .setDescription('The person you want to try and claim.')
                .setRequired(true)))
        .addSubcommand(subCommand => subCommand
            .setName('buy')
            .setDescription('Buying people is pog')
            .addUserOption(user => user
                .setName('target')
                .setDescription('The person you want to buy.')
                .setRequired(true))
            .addIntegerOption(option => option
                .setName('amount')
                .setDescription('How much are you willing to pay?')
                .setRequired(true)
                .setMinValue(minWaifuValue)
                .setMaxValue(maxWaifuValue)))
        .addSubcommand(subCommand => subCommand
            .setName('pimp')
            .setDescription('Pimp out your waifus to earn some extra coin.'))
        .addSubcommand(subCommand => subCommand
            .setName('gag')
            .setDescription('Gag your waifu whenever they are annoying.')
                .addUserOption(option => option
                    .setName('target')
                    .setDescription('The waifu you want to gag.')
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('time')
                    .setDescription('The amount of time to gag your waifu in minutes.')
                    .setMinValue(0)
                    .setMaxValue(gagMaxTime)))
        .addSubcommand(subCommand => subCommand
            .setName('sell')
            .setDescription('Selling people to other people is also pog')
            .addUserOption(user => user
                .setName('waifu')
                .setDescription('The waifu you are selling.')
                .setRequired(true))
            .addUserOption(user => user
                .setName('target')
                .setDescription('The recipient of the sale.')
                .setRequired(true))
            .addIntegerOption(option => option
                .setName('value')
                .setDescription('How much are you selling your waifu for?')
                .setRequired(true)
                .setMinValue(minWaifuValue)
                .setMaxValue(maxWaifuValue)))
        .addSubcommand(subCommand => subCommand
            .setName('disown')
            .setDescription('Disown one of your waifus')
            .addUserOption(user => user
                .setName('target')
                .setDescription('The waifu you want to disown.')
                .setRequired(true)))
        ,
	async execute(interaction) {
        const guildSocialCred = new Data.SocialCredit(interaction.guildId);
        const guildWaifu = new Data.Waifu(interaction.guildId);

        const subCommand = interaction.options.getSubcommand();

        const target = interaction.options.getUser('target');
        const author = interaction.user;

        let user = author;
        if(target != null)
            user = target;

        const embed = new EmbedBuilder().setColor('Random');

        switch(subCommand)
        {
            // General
            case "info":
            {
                // See who the user owns
                embed.setColor('LuminousVividPink').setTitle(`Here is the waifu info for ${user.username}`)
                const owned = guildWaifu.GetAllWaifuIDsOfOwnerID(user.id);
                waifuList = '\n`Waifu` - `Value`';
                for(const id of owned)
                {
                    waifuList += `\n<@${id}> - \`${guildWaifu.GetWaifuValue(id)}\``
                }

                if(owned.length != 0)
                {
                    embed.addFields({name: 'Ownership', value: `${user} owns all of the following waifus: ${waifuList}`});//<@${owned.join('>, <@')}>`);
                }
                else
                {
                    embed.addFields({name: 'Ownership', value: `${user} does not own any waifus.`});
                }

                // Who owns the user
                const waifuOwnerID = guildWaifu.GetWaifuOwnerID(user.id);
                const waifuValue = guildWaifu.GetWaifuValue(user.id);
                if(waifuOwnerID != null)
                {
                    embed.addFields({name: 'Owner', value: `${user} is owned by <@${waifuOwnerID}> with a value of \`${waifuValue}\`.`});
                }
                else
                {
                    if(waifuValue != null)
                    {
                        embed.addFields({name: 'Owner' , value: `${user} is not owned by anyone but can be claimed with a value of \`${waifuValue}\`.`});
                    }
                    else
                    {
                        embed.addFields({name: 'Owner' ,value: `${user} is not owned by anyone and is not able to be claimed.`});
                    }
                }
                return interaction.reply({embeds: [embed]});
            }
            case "market":
            {
                embed.setColor('DarkGreen').setTitle('Waifu Market')
                const market = guildWaifu.GetWaifusOnMarket();
                if(market.length != 0)
                {
                    embed.setDescription(`\`Waifu\` - \`Value\`\n${market.join('\n')}`);
                    return interaction.reply({embeds: [embed]});
                }
                embed.setDescription('None at the moment');
                return interaction.reply({embeds: [embed]});
            }

            // As_Waifu
            case "value":
            {
                const value = interaction.options.getInteger('value');
                embed.setColor('DarkPurple').setTitle(`Attempting to change your waifu value to ${value}`)
                if(guildWaifu.GetWaifuOwnerID(author.id) != null)
                {
                    embed.setDescription(`Silly waifu, you are already claimed by <@${guildWaifu.GetWaifuOwnerID(author.id)}> valued at \`${guildWaifu.GetWaifuValue(author.id)}\` cred.`);
                    return interaction.reply({embeds: [embed]});
                }
                if(guildSocialCred.GetSocialCreditOfUser(author.id) < minSocialCredit)
                {
                    embed.setDescription(`If you want to change your waifu value, you need to get above terrible(\`${minSocialCredit}\`) social credit first.`);
                    return interaction.reply({embeds: [embed]});
                }
        
                if(value != 0)
                {
                    guildWaifu.SetWaifuValue(author.id, value);
                    embed.setDescription(`You are now able to be claimed with the value of \`${value}\` cred.`);
                    return interaction.reply({embeds: [embed]});
                }
                guildWaifu.SetWaifuValue(author.id, null);
                embed.setDescription(`You are no longer able to be claimed on the market.`)
                return interaction.reply({embeds: [embed]});
            }
            case "submit":
            {
                const submitTo = interaction.options.getUser('your_new_owner');
                if(submitTo == author)
                {
                    return interaction.reply(`You can't submit to yourself.`);
                }
                const waifuOwner = guildWaifu.GetWaifuOwnerID(author.id);
                if(waifuOwner != null)
                {
                    return interaction.reply(`Silly Waifu. You can't submit to someone else when you are already owned by ${waifuOwner}.`);
                }
                const value = interaction.options.getInteger('value');
                (async () => {
                    const result = await Helper.InteractionGetConfimationFromUser(interaction, submitTo.id, 30,
                        `Hey ${submitTo}, ${author} would like to submit to you and be your waifu with a value of \`${value}\`. Do you accept?`,
                        `${submitTo} did not respond to the request from ${author} to submit themselves as their waifu with a value of \`${value}\`.`,
                        `${submitTo} accepted the offer from ${author} to submit themselves as their waifu with a value of \`${value}\`.`,
                        `${submitTo} declined the offer from ${author} to submit themselves as their waifu with a value of \`${value}\`.`)
                    if(result)
                    {
                        if(guildWaifu.GetWaifuOwnerID(author.id) != null)
                        {
                            return interaction.followUp(`How did you get owned during the time of this request?\nThis submit request has been voided.`);
                        }
                        guildWaifu.SetWaifuValue(author.id, value);
                        guildWaifu.SetWaifuOwnerID(author.id, submitTo.id);
                        console.log(`${Date()} : ${author.username}[${author.id}] submitted themselves to ${submitTo.username}[${submitTo.id}] for a value of ${value} in guild ${interaction.guild.id}`);
                    }
                })()
                return;
            }
            case "buy_freedom":
            {
                const freedomCost = interaction.options.getInteger('offer');
                const ownerID = guildWaifu.GetWaifuOwnerID(author.id);
                if(ownerID == null)
                {
                    return interaction.reply(`Who are you buying freedom from? You aren't owned by anyone.`);
                }
                if(freedomCost > guildSocialCred.GetSocialCreditOfUser(author.id))
                {
                    return interaction.reply(`You don't have enough social credit to afford the offer you tried to make.`);
                }

                // Automatic freedom
                const ownerGuildMember = interaction.guild.members.cache.get(ownerID);
                const maxFreedomCost = 2 * guildWaifu.GetWaifuValue(author.id);
                if(freedomCost >= maxFreedomCost)
                {
                    guildSocialCred.SocialCreditTransfer(interaction.member, ownerGuildMember, maxFreedomCost, interaction);
                    guildWaifu.SetWaifuOwnerID(author.id, null);
                    guildWaifu.SetWaifuValue(author.id, null);
                    return interaction.reply(`Congradulations \`${author}\` you have earned your freedom back. Don't go into debt or you will be put up on the market again.`);
                }

                // Get confirmation from owner
                const ownerMention = `<@${ownerID}>`;
                (async () => {
                    const result = await Helper.InteractionGetConfimationFromUser(interaction, ownerID, 30,
                        `Hey <@!${ownerID}>, Your waifu ${author} would like to buy their freedom back for \`${freedomCost}\` social credit. Do you accept?`,
                        `${ownerMention} did not respond.`,
                        `${ownerMention} accepted ${author}'s offer and granted them their freedom for \`${freedomCost}\` social credit.`,
                        `${ownerMention} declined ${author}'s offer and so get fucked and shut up for 5 minutes.`)
                    if(result)
                    {
                        // Free them here
                        guildSocialCred.SocialCreditTransfer(interaction.member, ownerGuildMember, freedomCost, interaction);
                        guildWaifu.SetWaifuOwnerID(author.id, null);
                        guildWaifu.SetWaifuValue(author.id, null);
                    }
                    else
                    {
                        const member = interaction.guild.members.cache.get(author.id);

                        if(member.moderatable)
                        {
                            member.timeout(5 * 60 * 1000, `${author.username} requested freedom and it was denied or no response`);
                            return interaction.followUp(`Hey ${author}, Get Fucked. STFU loser`);
                        }
                    }
                })()
                return;
            }

            // Get_Waifus
            case "claim":
            {
                const targetUser = interaction.options.getUser('target');
                embed.setColor('Gold').setTitle(`Attempting to claim ${targetUser.username}`);
                if(targetUser.id == author.id)
                {
                    embed.setDescription(`Silly goose you can't claim yourself, try claiming someone else. See who is on the market with /waifu market`)
                    return interaction.reply({embeds: [embed]});
                }
                const waifuValue = guildWaifu.GetWaifuValue(targetUser.id)
                if(waifuValue == null)
                {
                    embed.setDescription(`${targetUser} is not able to be claimed as your waifu.`)
                    return interaction.reply({embeds: [embed]});
                }
                const ownerID = guildWaifu.GetWaifuOwnerID(targetUser.id)
                if(ownerID == author.id)
                {
                    embed.setDescription(`Hey dumbfuck, you already own ${targetUser} as your waifu.`);
                    return interaction.reply({embeds: [embed]});
                }
                if(ownerID != null)
                {
                    embed.setDescription(`${targetUser} is already owned by <@${ownerID}>.\nYou can ask them if they are willing to trade.`);
                    return interaction.reply({embeds: [embed]});
                }
                const credOfAuthor = guildSocialCred.GetSocialCreditOfUser(author.id)
                if(waifuValue > credOfAuthor)
                {
                    embed.setDescription(`You don't have enough social credit to claim ${targetUser}.\nTheir value is \`${waifuValue}\` and you only have \`${credOfAuthor}\`.`);
                    return interaction.reply({embeds: [embed]});
                }
                const targetGuildMember = interaction.guild.members.cache.get(targetUser.id);
                guildSocialCred.SocialCreditTransfer(interaction.member, targetGuildMember, waifuValue, interaction);
                guildWaifu.SetWaifuOwnerID(targetUser.id, author.id);
                console.log(`${Date()} : ${author.username}[${author.id}] has claimed ${targetUser.username}[${targetUser.id}] as their waifu for ${waifuValue} in guild ${interaction.guild.name}[${interaction.guild.id}]`);
                embed.setDescription(`You have claimed ${targetUser} as your new waifu!\nThey are valued at \`${waifuValue}\`.`);
                return interaction.reply({embeds: [embed]});
            }
            case "buy":
            {
                const waifuToBuy = interaction.options.getUser('target');
                if(waifuToBuy.id == author.id)
                {
                    return interaction.reply(`You can not buy yourself.`);
                }
                const offerAmount = interaction.options.getInteger('amount');
                if(offerAmount > guildSocialCred.GetSocialCreditOfUser(author.id))
                {
                    return interaction.reply(`You can not afford to lose \`${offerAmount}\` social credit.`);
                }
        
                let waifuOwnerID = guildWaifu.GetWaifuOwnerID(waifuToBuy.id);
                if(waifuOwnerID == author.id)
                {
                    embed.setDescription(`You already own ${waifuToBuy}.`)
                    return interaction.reply({embeds: [embed]});
                }

                if(guildWaifu.GetWaifuValue(waifuToBuy.id) == offerAmount)
                {
                    guildWaifu.SetWaifuOwnerID(waifuToBuy.id, author.id);
                    const waifuToBuyGuildMember = interaction.guild.members.cache.get(waifuToBuy.id);
                    guildSocialCred.SocialCreditTransfer(interaction.member, waifuToBuyGuildMember, offerAmount, interaction);
                    console.log(`${Date()} : ${author.username}[${author.id}] just bought ${waifuToBuy.username}[${waifwaifuOwnerIDuToBuy.id}] for a value cred of ${offerAmount} in guild ${interaction.guild.name}[${interaction.guild.id}]`);
                    embed.setDescription(`${author} just bought ${waifuToBuy} for a value of \`${offerAmount}\` social credit.`);
                    return interaction.reply({embeds: [embed]});
                }
                
                let initMessage = `Hey <@!${waifuOwnerID}>, ${author} would like to buy your waifu \`${waifuToBuy.username}\` for a value of \`${offerAmount}\` social credit.`;
                if(waifuOwnerID == null)
                {
                    waifuOwnerID = waifuToBuy.id
                    initMessage = `Hey ${waifuToBuy}, ${author} would like to buy you as their waifu with a value of \`${offerAmount}\` social credit.`;
                }
                
                const waifuOwnerMention = `<@${waifuOwnerID}>`;
                (async () => {
                    const result = await Helper.InteractionGetConfimationFromUser(
                        interaction, 
                        waifuOwnerID, 
                        30,
                        initMessage,
                        `${waifuOwnerMention} did not respond to the request from ${author} to buy the waifu ${waifuToBuy} for a value of \`${offerAmount}\` socical credit`,
                        `${waifuOwnerMention} accepted the offer from ${author} to buy the waifu ${waifuToBuy} for a value of \`${offerAmount}\` socical credit.`,
                        `${waifuOwnerMention} declined the offer from ${author} to buy the waifu ${waifuToBuy} for a value of \`${offerAmount}\` socical credit`)
                    if(result)
                    {
                        let waifuCheck = guildWaifu.GetWaifuOwnerID(waifuToBuy.id);
                        if(waifuCheck == null){ waifuCheck = waifuToBuy.id; }
                        if(waifuCheck != waifuOwnerID)
                        {
                            return interaction.followUp(`How did \`${waifuToBuy.username}\` get claimed or bought by another owner during the time of this request?\nThis buy request has been voided.`);
                        }
                        const ownerGuildMember = interaction.guild.members.cache.get(waifuOwnerID);
                        guildSocialCred.SocialCreditTransfer(interaction.member, ownerGuildMember, offerAmount, interaction);
                        guildWaifu.SetWaifuValue(waifuToBuy.id, offerAmount);
                        guildWaifu.SetWaifuOwnerID(waifuToBuy.id, author.id);
                        console.log(`${Date()} : ${author.username}[${author.id}] just bought ${waifuToBuy.username}[${waifuToBuy.id}] for a value cred of ${offerAmount} in guild ${interaction.guild.name}[${interaction.guild.id}]`);
                    }
                })()
                return;
            }

            // as_waifu_owner
            case "pimp":
            {
                const author = interaction.user;
                if(Data.Bitfield.GetPimpedStatus(author.id) == true)
                {
                    return interaction.reply(`You have already pimped out your waifus today.`);
                }
                const waifuIDs = guildWaifu.GetAllWaifuIDsOfOwnerID(author.id);
                if(waifuIDs.length === 0)
                {
                    return interaction.reply(`You don't own any waifus to pimp out.`);
                }
                Data.Bitfield.SetPimpedStatus(author.id, true);
                var totalSum = 0;
                var output = "You have pimped out all of your waifus. Here is how much they made:";
                const guildSize = new Data.Size(interaction.guildId);
                for(let i = 0; i < waifuIDs.length; i++)
                {
                    let waifuSize = guildSize.GetSizeOfUser(waifuIDs[i]);
                    if(waifuSize == null)
                    {
                        output += `\n<@${waifuIDs[i]}> Made \`0\` coin. I need to know their size first to pimp them out.`
                    }
                    else
                    {
                        if(waifuSize >= 0) { waifuSize++; }
                        else { waifuSize = Math.abs(waifuSize); }
                        const waifuMade = NoDependents.RollDice(guildWaifu.GetWaifuValue(waifuIDs[i]) / pimpValuePerDie, waifuSize);
                        totalSum += waifuMade;
                        const waifuCut = Math.floor(waifuMade / 2);
                        const ownerCut = Math.ceil(waifuMade / 2);
                        Data.Coin.ChangeCoinOfUserByAmount(author.id, ownerCut)
                        Data.Coin.ChangeCoinOfUserByAmount(waifuIDs[i], waifuCut);
                        output += `\n<@${waifuIDs[i]}> made \`${waifuMade}\` coin getting pimped out, giving \`${ownerCut}\` coin to you, and keeping \`${waifuCut}\` coin for themselves.`;
                    }
                }
                console.log(`${Date()} : ${author.username}[${author.id}] pimped out their waifus[${waifuIDs.length}]  making [${totalSum}] coin`);
                embed.setDescription(output).setFooter({text: `Your new coin balance is: ${Data.Coin.GetCoinOfUser(author.id)}.`});
                return interaction.reply({embeds: [embed]});
            }
            case "gag":
            {
                const embed = new EmbedBuilder();
                const waifu = interaction.options.getUser('target');
                if(guildWaifu.GetWaifuOwnerID(waifu.id) != author.id)
                {
                    return interaction.reply(`You can only gag a waifu that you own.`);
                }

                const member = interaction.guild.members.cache.get(waifu.id);
                if(!member.moderatable)
                {
                    return interaction.reply({content: `${waifu} is too powerful to be gagged. (Admin or higher in role hierarchy)`, ephemeral: true});
                }

                let time = interaction.options.getNumber('time');
                if(time == null)
                    time = 5;

                // Ungag
                if(time == 0)
                {
                    member.timeout(null, `${author.username} ungagged their waifu`);
                    embed.setDescription(`${author} ungagged their waifu ${waifu.username}.`);
                    return interaction.reply({embeds: [embed]});
                }

                // No reply only channel message
                interaction.deferReply();
                interaction.deleteReply();

                const unGagHash = NoDependents.GenerateUserHash(interaction.user.id);
                const unGagButton = new ButtonBuilder()
                    .setCustomId(unGagHash)
                    .setLabel('Ungag Early')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(false);
                const row = new ActionRowBuilder()
                    .addComponents(
                        unGagButton
                    );

                const start = new Date();
                
                member.timeout(time * 60 * 1000, `${author.username} gagged their waifu for ${time} minutes`);
                embed.setTitle('Waifu Gagged').setDescription(`${author} gagged their waifu ${waifu} for \`${time}\` minutes.\n${author} can ungag their waifu early by pressing the button below.`)
                const message = await interaction.channel.send({
                    embeds: [embed],
                    components: [row]
                });

                const filter = (btnInt) => {
                    return btnInt.customId == unGagHash;
                }
                const collector = interaction.channel.createMessageComponentCollector({
                    filter,
                    time: time * 60 * 1000
                })

                collector.on('collect', buttonInt =>
                {
                    if(author.id != buttonInt.user.id)
                    {
                        if(buttonInt.member.moderatable)
                        {
                            buttonInt.member.timeout(60 * 1000, `Responded to a button that wasn't theirs.`);
                            return buttonInt.reply({ content: `This button isn't for you. Just for that why don't you join your gagged friend.`, ephemeral: true });
                        }
                        return buttonInt.reply({ content: `This button isn't for you!`, ephemeral: true });
                    }
                    buttonInt.deferUpdate();
                    const end = new Date();
                    member.timeout(0, `${author.username} ungagged their waifu early after ${Math.floor((end - start) / 1000)} seconds`);
                    embed.setDescription(`${waifu} has been ungagged early after \`${Math.floor((end - start) / 1000)}\` seconds.`);
                    message.edit({
                        embeds: [embed],
                        components: []
                    });
                    return;
                });

                collector.on('end', async (collection) => {
                    if(!collection.first())
                    {
                        embed.setDescription(`${waifu} has been automatically ungagged after \`${time}\` minutes.`);
                        message.edit({
                            embeds: [embed],
                            components: []
                        });
                        return;
                    }
                });
                return;
            }
            case "sell":
            {
                const waifu = interaction.options.getUser('waifu');
                const sellTo = interaction.options.getUser('target');
                const amount = interaction.options.getInteger('value');

                const waifuOwnerID = guildWaifu.GetWaifuOwnerID(waifu.id);
                if(waifuOwnerID != author.id)
                {
                    return interaction.reply({content: `You do not own \`${waifu.username}\`.`, ephemeral: true});
                }
                if(author.id == sellTo.id)
                {
                    return interaction.reply({content: `You can't sell a waifu to yourself.`, ephemeral: true});
                }
                if(amount > guildSocialCred.GetSocialCreditOfUser(sellTo.id))
                {
                    embed.setTitle('Waifu Sell').setDescription(`${sellTo} does not have enough social credit to accept the offer for \`${amount}\` social credit. They only have \`${guildSocialCred.GetSocialCreditOfUser(sellTo.id)}\` social credit.`);
                    return interaction.reply({embeds: [embed]});
                }

                (async () => {
                    const result = await Helper.InteractionGetConfimationFromUser(
                        interaction, 
                        sellTo.id, 
                        30,
                        `Hey ${sellTo}, ${author} wants to sell their waifu ${waifu} to you with a value of ${amount} social credit. Do you accept?`,
                        `${sellTo} did not respond to ${author}'s\` offer to sell their waifu ${waifu} for a value of ${amount} social credit.`,
                        `${sellTo} accepted ${author}'s offer to sell their waifu ${waifu} for a value of ${amount} social credit.`,
                        `${sellTo} declined ${author}'s offer to sell their waifu ${waifu} for a value of ${amount} social credit.`)
                    if(result)
                    {
                        if(guildWaifu.GetWaifuOwnerID(waifu.id) != waifuOwnerID)
                        {
                            return interaction.followUp(`How did ${waifu} get out of your ownership during the time of this request?\nThis sell request has been voided.`);
                        }
                        const sellGuildMember = interaction.guild.members.cache.get(sellTo.id);
                        guildSocialCred.SocialCreditTransfer(sellGuildMember, interaction.member, amount, interaction);
                        guildWaifu.SetWaifuOwnerID(waifu.id, sellTo.id);
                        guildWaifu.SetWaifuValue(waifu.id, amount);
                        console.log(`${Date()} : ${author.username}[${author.id}] has sold waifu ${waifu.username}[${waifu.id}] to ${sellTo.username}[${sellTo.id}] for a value of ${amount} in guild ${interaction.guild.name}[${interaction.guild.id}]`);
                    }
                })()
                return;
            }
            case "disown":
            {
                const waifu = interaction.options.getUser('target');
                const waifuOwnerID = guildWaifu.GetWaifuOwnerID(waifu.id);
                embed.setColor('DarkRed').setTitle(`Attempting to disown ${waifu.username}`);
                if(waifuOwnerID != author.id)
                {
                    embed.setDescription(`You do not own ${waifu}`);
                    return interaction.reply({embeds: [embed]});
                }

                const waifuValue = guildWaifu.GetWaifuValue(waifu.id);
                guildWaifu.SetWaifuOwnerID(waifu.id, null);
                guildWaifu.SetWaifuValue(waifu.id, null);
                const waifuGuildMember = interaction.guild.members.cache.get(waifu.id);
                guildSocialCred.SocialCreditTransfer(waifuGuildMember, interaction.member, Math.ceil(waifuValue / 2.0), interaction);

                embed.setDescription(`${author} has disowned ${waifu} as their waifu. For being such a disgrace of a waifu. Your previous owner took \`${Math.ceil(waifuValue / 2.0)}\`(50%) of your waifu value back.`);
                return interaction.reply({embeds: [embed]});
            }
        }
        return interaction.reply(`Error Code 69`);
	},
};
