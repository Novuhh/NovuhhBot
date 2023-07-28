const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const Discord = require('discord.js');
const Data = require("./user_data.js");
const NoDependents = require('./helper_no_dependents.js');
const { slotEmotes } = require('../data/constants.json');
const { slotEmojis } = require('../data/constants.json')
const [ cherry, bar, bar2, bar3, seven, jackpot ] = [slotEmojis.cherry, slotEmojis.bar, slotEmojis.bar2, slotEmojis.bar3, slotEmojis.seven, slotEmojis.jackpot];

module.exports.Slots = function(userID, bet)
{
    const reel = [cherry,cherry,bar,bar,bar2,bar2,bar3,bar3,seven,seven,jackpot,
                '⬜','⬜','⬜','⬜','⬜','⬜','⬜','⬜','⬜','⬜','⬜'];
    const landed = [reel[Math.floor(Math.random() * reel.length)],reel[Math.floor(Math.random() * reel.length)],reel[Math.floor(Math.random() * reel.length)]];

    const numberOfJackpot = NoDependents.NumberOfValueInArray(landed, jackpot);
    const numberOfSeven = NoDependents.NumberOfValueInArray(landed, seven);
    const numberOfBar3 = NoDependents.NumberOfValueInArray(landed, bar3);
    const numberOfBar2 = NoDependents.NumberOfValueInArray(landed, bar2);
    const numberOfBar = NoDependents.NumberOfValueInArray(landed, bar);
    const numberOfCherry = NoDependents.NumberOfValueInArray(landed, cherry);

    var payout = 0;
    
    // Slots payout
    if(numberOfJackpot == 3)
        payout = 1048
    else if(numberOfSeven == 3)
        payout = 128
    else if(numberOfBar3 == 3)
        payout = 64
    else if(numberOfBar2 == 3)
        payout = 16
    else if(numberOfBar == 3 || numberOfCherry == 3)
        payout = 8
    else if (numberOfBar == 2 || numberOfBar2 == 2 || numberOfBar3 == 2 || numberOfCherry == 2)
        payout = 4
    else if(numberOfCherry == 1)
        payout = 1

    // Multipliers
    if(numberOfJackpot == 2)
        payout *= 16
    else if(numberOfJackpot == 1)
        payout *= 4

    const output = slotEmotes[0] + slotEmotes[7]  + slotEmotes[8]  + slotEmotes[9]  + slotEmotes[1] + slotEmotes[6] + '\n' + 
                   slotEmotes[2] + landed[0]      + landed[1]      + landed[2]      + slotEmotes[2] + slotEmotes[5] + '\n' + 
                   slotEmotes[3] + slotEmotes[10] + slotEmotes[11] + slotEmotes[12] + slotEmotes[4] + '\n';

    // time to payout
    payout *= bet;

    // Just want visual, not apply coin change
    if(userID == null)
        return [output, payout]

    Data.Coin.ChangeCoinOfUserByAmount(userID, payout - bet);
    Data.Gamble.IncrementLeverPulls(userID);
    Data.Gamble.ChangeGambleLostOfUser(userID, bet)
    Data.GambleStats.ChangeSlotsPayinByAmount(bet);

    if(payout != 0)
    {
        Data.Gamble.ChangeGambleWonOfUser(userID, payout);
        Data.GambleStats.ChangeSlotsPayoutByAmount(payout);
    }

    return [output, payout];
}

module.exports.InteractionGetConfimationFromUser = function(
    interaction, 
    confirmNeededID,
    seconds = 30,
    initMessage = `Hey <@!${confirmNeededID}>, Do you accept?`, 
    noResponseMessage = `<@${confirmNeededID}> did not respond.`, 
    acceptMessage = `<@${confirmNeededID}> accepted.`, 
    denyMessage = `<@${confirmNeededID}> declined.`)
{
    return new Promise(resolve => {
        const acceptHash = NoDependents.GenerateUserHash(interaction.user.id);
        const denyHash = NoDependents.GenerateUserHash(interaction.user.id);
        const acceptButton = new ButtonBuilder()
            .setCustomId(acceptHash)
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
        const denyButton = new ButtonBuilder()
            .setCustomId(denyHash)
            .setLabel('Decline')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false);
        const row = new ActionRowBuilder()
            .addComponents(
                acceptButton,
                denyButton
            );
        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`Confirmation Required`)
            .setDescription(initMessage);

        interaction.reply({ 
            content: `<@${confirmNeededID}> Ping!`,
            embeds: [embed], 
            components: [row] 
        });

        const filter = (btnInt) => {
            return btnInt.customId == acceptHash || btnInt.customId == denyHash;
        }
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: seconds * 1000
        })

        collector.on('collect', buttonInt => {
            if(buttonInt.user.id != confirmNeededID)
            {
                return buttonInt.reply({ content: `These buttons aren't for you.`, ephemeral: true });
            }
            buttonInt.deferUpdate();
            if(buttonInt.customId == acceptHash)
            {
                embed.setDescription(acceptMessage).setColor('Green');
                interaction.editReply({ 
                    embeds: [embed],
                    components: [] 
                });
                return resolve(true);
            }
            else
            {
                embed.setDescription(denyMessage).setColor('Red');
                interaction.editReply({ 
                    embeds: [embed], 
                    components: [] 
                });
                return resolve(false);
            }
        });

        collector.on('end', async (collection) => {
            if(collection.size == 0)
            {
                embed.setDescription(noResponseMessage).setColor('NotQuiteBlack');
                interaction.editReply({ 
                    embeds: [embed], 
                    components: [] 
                });
            }
            return resolve(false);
        });
    })
}

module.exports.UpdateStatus = function(client)
{
    const activity = Data.Activity.GetActivity();
    if(activity.type == -1){ return; }
    if(activity.type == 2)
    {
        client.user.setActivity({
            name: activity.text, 
            type: activity.type, 
            url: activity.url
        });
    }
    else
    {
        client.user.setActivity({
            name: activity.text,
            type: activity.type 
        });
    }

}

module.exports.ResetWorked = function()
{
    const workersWorked = Data.Work.GetNumberOfWorkersWorked();
    Data.Work.ResetNumberOfWorkersWorked();    
    
    // Pay office managers here
    for(let manager of Data.Bitfield.GetAllOfficeManagerIDs())
    {
        Data.Coin.ChangeCoinOfUserByAmount(manager, workersWorked * 50);
    }

    Data.Bitfield.SetWorkedStatusOfAll(false);
}

module.exports.RunEveryDay = function(client)
{
    this.ResetWorked();
    Data.Bitfield.SetPimpedStatusOfAll(false);
    Data.BackupJson();
}