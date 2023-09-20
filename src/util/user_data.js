const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const { defaultSocialCred, minSocialCredit, defaultWaifuPrice, leaderboardSize, defaultPrefix, coinleadboardsize } = require('../data/constants.json');

const rawData = fs.readFileSync('./src/data/user_data.json');//'../data/user_data.json');
const storedData = JSON.parse(rawData);

const rawConfig = fs.readFileSync('./src/data/config.json');
const config = JSON.parse(rawConfig)

// Save the data in the storedData object to the json file
module.exports.SaveToJson = function()
{
    const stringified = JSON.stringify(storedData, null, 2);   // turns data back into json format
    fs.writeFileSync('./src/data/user_data.json', stringified); //default: 'utf8'
    console.log(`${Date()} : UserData.json has been updated`);
}

module.exports.BackupJson = function(comment = "")
{
    const stringified = JSON.stringify(storedData, null, 2);   // turns data back into json format
    const date = new Date();
    try{
        if(comment == "")
        {
            fs.writeFile(`./src/data/backups/user_data_${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}.json`, stringified); //default: 'utf8'
        }
        else
        {
            fs.writeFile(`./src/data/backups/user_data_${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}_${comment}.json`, stringified); //default: 'utf8'
        }
    } catch { console.error }
    console.log(`${date} : UserData.json has been backed up`);
}

// Checks if user is already in the json file
function CheckIfUserIsInJSON(userID)
{
    return storedData.users[userID] != null;
}

function SaveConfig()
{
    const stringified = JSON.stringify(config, null, 2);   // turns data back into json format
    fs.writeFileSync('./src/data/config.json', stringified); //default: 'utf8'
}

// Add a new user to the user_data
function AddUserToJSON(userID)
{
    // prevents duplicate users by checking they dont exist already
    if(!CheckIfUserIsInJSON(userID))
    {
        console.log(`${Date()} : User ${userID} - has been added to the json file`);
        storedData.users[userID] = {};           
    } 
    else 
    {
        console.log(`${Date()} : ${userID} - is already in the json file`);
    }
}
function RemoveUserFromJSON(userID)
{
    // prevents duplicate users by checking they dont exist already
    if(CheckIfUserIsInJSON(userID))
    {     
        delete storedData.users[userID];
        console.log(`${Date()} : ${userID} - has been removed from the json file`);   
    } 
    else 
    {
        console.log(`${Date()} : ${userID} - is not in the json so action to remove taken`);
    }
}

function CheckIfGuildIsInJson(guildID)
{
    return storedData.guilds[guildID] != null;
}

function AddGuildToJson(guildID)
{
    if(guildID == null){ return console.log(`${Date()} : Attemted to add an undefined guild to the json`); }
    if(!CheckIfGuildIsInJson(guildID))
    {
        console.log(`${Date()} : Guild ${guildID} - has been added to the json file`);
        storedData.guilds[guildID] = {};
        storedData.guilds[guildID].blacklisted_phrases = [];
        storedData.guilds[guildID].users = {};
    }
    else
    {
        console.log(`${Date()} : Guild ${guildID} - is already in the json file`);
    }
}
module.exports.AddGuildToJson = AddGuildToJson;

module.exports.GetDevUsers = function()
{
    return config.devIDs;
}

module.exports.GetDevGuilds = function()
{
    return config.devGuilds;
}

module.exports.AddGuildToDevGuilds = function(guildID)
{
    if(config.devGuilds.includes(guildID))
    {
        console.log(`${Date()} : Attempting to add guild[${guildID}] to dev guild array. Already in array. No change made.`);
    }
    else
    {
        config.devGuilds.push(guildID);
        console.log(`${Date()} : Added guild[${guildID}] to dev guild array`);
        SaveConfig();
    }
}

module.exports.RemoveGuildFromDevGuilds = function(guildID)
{
    if(config.devGuilds.includes(guildID))
    {
        config.devGuilds = config.devGuilds.filter(function(element){ return element != guildID; })
        console.log(`${Date()} : Rmoved guild[${guildID}] to dev guild array`);
        SaveConfig();
    }
    else
    {
        console.log(`${Date()} : Attempting to remove guild[${guildID}] from dev guild array. Not in array. No change made.`);
    }
}

module.exports.RemoveGuildFromJson = function(guildID)
{
    if(CheckIfGuildIsInJson(guildID))
    {   
        delete storedData.guilds[guildID];
        console.log(`${Date()} : Guild ${guildID} - has been removed from the json file`);   
    } 
    else 
    {
        console.log(`${Date()} : Guild ${guildID} - is not in the json so action to remove taken`);
    }
}

function GetUsernameOfUserID(userID)
{
    // User not in json or does not have username
    if(!CheckIfUserIsInJSON(userID) || !storedData.users[userID].username)
        return "Cannot get username";
    
    return storedData.users[userID].username;
}

class GuildData
{
    constructor(guildID)
    {
        this.guildID = guildID;
        if(!CheckIfGuildIsInJson(guildID)){ AddGuildToJson(guildID); }
    }

    CheckIfUserHasGuildData(userID)
    {
        return CheckIfGuildIsInJson(this.guildID) && storedData.guilds[this.guildID].users[userID] != null;
    }
    AddUserToGuild(userID)
    {
        if(!CheckIfUserIsInJSON(userID)) { AddUserToJSON(userID); }
        if(!this.CheckIfUserHasGuildData(userID))
        {
            storedData.guilds[this.guildID].users[userID] = {};
            console.log(`${Date()} : ADD SUCCESS User[${userID}] is has been added to guild[${this.guildID}]`);
        }
        else
        {
            console.log(`${Date()} : ADD FAILED User[${userID}] is already in guild[${this.guildID}]`);
        }
    }
    RemoveUserFromGuild(userID)
    {
        if(this.CheckIfUserHasGuildData(userID))
        {
            delete storedData.guilds[this.guildID].users[userID];
            console.log(`${Date()} : REMOVE SUCCESS User[${userID}] is has been removed to guild[${this.guildID}]`);
        }
        else
        {
            console.log(`${Date()} : REMOVE FAILED User[${userID}] is not in guild[${this.guildID}]`);
        }
    }

    GetPrefix()
    {
        if(storedData.guilds[this.guildID].prefix == null)
        {
            return defaultPrefix;
        }
        return storedData.guilds[this.guildID].prefix;
    }

    SetPrefix(newPrefix)
    {
        if(newPrefix == defaultPrefix)
        {
            delete storedData.guilds[this.guildID].prefix;
        }
        else
        {
            storedData.guilds[this.guildID].prefix = newPrefix
        }
    }
}
module.exports.GuildData = GuildData;

// A class that handles all of the functions for a user's size
class Size extends GuildData
{
    constructor(guildID)
    {
        super(guildID);
    }

    CheckIfUserHasSize(userID)
    {
        return this.CheckIfUserHasGuildData(userID) && storedData.guilds[this.guildID].users[userID].size != null;
    }

    GetSizeOfUser(userID)
    {
        if(!this.CheckIfUserHasSize(userID)) { return null; }
        return storedData.guilds[this.guildID].users[userID].size;
    }

    ChangeSizeOfUser(userID, amount)
    {
        if(!this.CheckIfUserHasGuildData(userID)) { this.AddUserToGuild(userID); }
        let curSize = this.GetSizeOfUser(userID);
        if(curSize == null)
        {
            curSize = 0;
        }
        storedData.guilds[this.guildID].users[userID].size = curSize + amount;
    }

    SetSizeOfUser(userID, newSize)
    {
        if(!this.CheckIfUserHasGuildData(userID)) { this.AddUserToGuild(userID); }   // Add user if not added already
        if(newSize == null)
        {
            // Generate the size (0-12)
            newSize = Math.floor(Math.random()*13);
            // Cock 90% or pussy 10% 
            if(Math.random() < 0.1)
            {
                newSize *= -1;
                newSize--;
                if(storedData.guilds[this.guildID].users[userID].socialCredit == null)
                {
                    storedData.guilds[this.guildID].users[userID].socialCredit = 900;
                }
                else
                {
                    storedData.guilds[this.guildID].users[userID].socialCredit -= 100;
                }
            }
            console.log(`${Date()} : ${userID} - has had their size assigned to ${newSize}`);        
        }
        storedData.guilds[this.guildID].users[userID].size = newSize;
        return
    }
}
module.exports.Size = Size;

// A class that handles all of the functions for the blacklist
class Blacklist extends GuildData
{
    constructor(guildID) 
    {
        super(guildID);
    }

    GetBlacklistDelete()
    {
        if(storedData.guilds[this.guildID].blacklistDelete == null)
        {
            return false;
        }
        return storedData.guilds[this.guildID].blacklistDelete;
    }

    SetBlacklistDelete(onOrOff)
    {
        if(onOrOff == true)
        {
            storedData.guilds[this.guildID].blacklistDelete = true;
        }
        else
        {
            delete storedData.guilds[this.guildID].blacklistDelete;
        }
    }

    GetBlacklistArray()
    {
        return storedData.guilds[this.guildID].blacklisted_phrases;
    }

    AddPhraseToBlacklist(phrase)
    {
        const index = storedData.guilds[this.guildID].blacklisted_phrases.indexOf(phrase.toLowerCase());
        if(index == -1)
        {
            storedData.guilds[this.guildID].blacklisted_phrases.push(phrase.toLowerCase());
            return true;
        }
        return false;
    }

    RemovePhraseFromBlacklist(phrase)
    {
        const index = storedData.guilds[this.guildID].blacklisted_phrases.indexOf(phrase);
        if(index != -1)
        {
            storedData.guilds[this.guildID].blacklisted_phrases.splice(index, 1);
            return true;
        }
        return false;
    }

    CheckStringForBlacklistedPhrases(message)
    {
        let numberOfInfractions = 0;

        for(let phrase of storedData.guilds[this.guildID].blacklisted_phrases)
        {
            numberOfInfractions += message.split(phrase).length - 1;
        }

        return numberOfInfractions;
    }
}
module.exports.Blacklist = Blacklist;

class SocialCredit extends GuildData
{
    constructor (guildID) 
    {
        super(guildID)
    }

    GetSocialCreditOfUser(userID)
    {
        if(!this.CheckIfUserHasGuildData(userID) || storedData.guilds[this.guildID].users[userID].socialCredit == null)
        { 
            return defaultSocialCred; 
        }
        return storedData.guilds[this.guildID].users[userID].socialCredit;
    }

    SetSocialCreditOfUser(userID, amount)
    {
        // Add the user to the json if not already in it
        if(!this.CheckIfUserHasGuildData(userID)) { this.AddUserToGuild(userID); }
        if(amount == null || isNaN(parseInt(amount)))
        {
            delete storedData.guilds[this.guildID].users[userID].socialCredit;
            return;
        }

        storedData.guilds[this.guildID].users[userID].socialCredit = parseInt(amount);
        return;
    }

    ChangeSocialCreditOfUserByAmount(guildMember, amount, message)
    {
        const userID = guildMember.id;
        if(amount == null || isNaN(parseInt(amount)))
        {
            return console.log(`${Date()} : Failed to change amount of social credit of user[${userID}] in guild[${this.guildID}]`);
        }
        if(!this.CheckIfUserHasGuildData(userID)) { this.AddUserToGuild(userID); }

        const cred = this.GetSocialCreditOfUser(userID);
        storedData.guilds[this.guildID].users[userID].socialCredit = cred + amount;


        // Slavery time
        if(cred + amount < minSocialCredit && storedData.guilds[this.guildID].users[userID].waifuOwner == null && 
            (storedData.guilds[this.guildID].users[userID].waifuValue == null || storedData.guilds[this.guildID].users[userID].waifuValue > defaultWaifuPrice))
        {
            // Get the new waifu value to assign to the waifu
            let newWaifuValue = storedData.guilds[this.guildID].users[userID].waifuValue;
            if(isNaN(newWaifuValue)) { newWaifuValue = defaultWaifuPrice; }
            newWaifuValue = Math.min(newWaifuValue, defaultWaifuPrice)
            storedData.guilds[this.guildID].users[userID].waifuValue = newWaifuValue;

            try {
                const embed = new EmbedBuilder()
                    .setTitle('Terrible Social Credit Alert')
                    .setColor('DarkRed')
                    .setDescription(`${guildMember} has been put on the waifu market with a value of \`${newWaifuValue}\`. Maybe you should stop being a leech to society and be useful. You can not change your waifu value or remove yourself from the market until you get out of terrible social credit standing.`)
                message.channel.send({embeds: [embed]});
            } catch(e) {
                console.error(e)
            }
        }

        // Credit debt
        if(cred + amount < 0)
        {
            storedData.guilds[this.guildID].users[userID].socialCredit = 0;
            if(guildMember.moderatable)
            {
                guildMember.timeout(Math.abs(cred + amount) * 60 * 1000, "Social credit debt").catch(console.error)
                message.channel.send(`\`${guildMember.nickname}\` has no more social credit. Maybe it's time for you to disappear for a bit. See you in \`${Math.abs(cred + amount)}\` minutes.`);
            }
            else
            {
                message.channel.send(`\`${guildMember.nickname}\` has no more social credit. Too bad I have orders not to punish you further.`);
            }
        }
    }

    SocialCreditTransfer(giverGuildMember, reciverGuildMember, amount, message)
    {
        this.ChangeSocialCreditOfUserByAmount(giverGuildMember, -amount, message);
        this.ChangeSocialCreditOfUserByAmount(reciverGuildMember, amount, message);
    }

    SocialCreditLeader()
    {
        const allUsers = Object.keys(storedData.guilds[this.guildID].users);
        var creditMatrix = new Array();
        // loop through all users adding coin values to the coin matrix if they have one
        for(let userID of allUsers)
        {
            //console.log(storedData.users[userID].coin);
            if(storedData.guilds[this.guildID].users[userID].socialCredit != null)
            {
                creditMatrix.push([storedData.guilds[this.guildID].users[userID].socialCredit, userID]);
            }
        }
        creditMatrix.sort(function(a,b){return parseInt(b) - parseInt(a);});
        if(creditMatrix.length <= leaderboardSize) { return creditMatrix; }
        creditMatrix.splice(leaderboardSize / 2, creditMatrix.length - leaderboardSize);
        return creditMatrix;
    }
}
module.exports.SocialCredit = SocialCredit;

class Coin
{
    constructor () {}
    static GetCoinOfUser(userID)
    {
        if(!CheckIfUserIsInJSON(userID)) { return 0; }
        if(storedData.users[userID].coin == null) { return 0; }
        return storedData.users[userID].coin;
    }

    static SetCoinOfUser(userID, amount)
    {
        if(!CheckIfUserIsInJSON(userID)) { AddUserToJSON(userID); }
        if(isNaN(parseInt(amount))){ delete storedData.users[userID].coin; }
        else{ storedData.users[userID].coin = parseInt(amount); }
    }

    static ChangeCoinOfUserByAmount(userID, amount)
    {
        if(isNaN(parseInt(amount))) throw new Error(`ChangeCoinAmount amount must be a number`);
        this.SetCoinOfUser(userID, this.GetCoinOfUser(userID) + parseInt(amount));
    }

    static CoinTransfer(giverUserID, reciverUserID, amount)
    {
        this.ChangeCoinOfUserByAmount(giverUserID, -amount);
        this.ChangeCoinOfUserByAmount(reciverUserID, amount);
    }

    static CoinLeader()
    {
        const allUsers = Object.keys(storedData.users);
        var coinMatrix = new Array();
        // loop through all users adding coin values to the coin matrix if they have one
        for(let userID of allUsers)
        {  
            //console.log(storedData.users[userID].coin);
            if(storedData.users[userID].coin)
            {
                coinMatrix.push([storedData.users[userID].coin, userID]);
            }
        }
        coinMatrix.sort(function(a,b){return parseInt(b) - parseInt(a);});
        coinMatrix.splice(coinleadboardsize);
        return coinMatrix;
    }
}
module.exports.Coin = Coin;

/*
    0b0000 0000 0000 0000 0000 0000 0000 0000   // Default state
    0b0000 0000 0000 0000 0000 0000 0000 0001   // Has worked status
    0b0000 0000 0000 0000 0000 0000 0000 0010   // Worked As Office Manager
    0b0000 0000 0000 0000 0000 0000 0001 0000   // Has pimped out waifus
*/
const emptyBitfield = 0b0;
const worked = 0b1;
const workedManager = 0b10;
const pimped = 0b10000;
const fullBitfield = 0xffffffff;

class Bitfield
{
    static CheckIfUserHasBitfield(userID)
    {
        if(CheckIfUserIsInJSON(userID) && storedData.users[userID].bitfield != null) 
            return true;
        return false;
    }
    static AddBitfieldToUser(userID)
    {
        if(this.CheckIfUserHasBitfield(userID)) { return; }
        if(!CheckIfUserIsInJSON(userID)) { AddUserToJSON(userID); }
        storedData.users[userID].bitfield = 0;
        console.log(`${Date()} : ${userID} has had their bitfield assigned`);
    }

    // Worked
    static GetUserWorkedStatus(userID)
    {
        if(!this.CheckIfUserHasBitfield(userID)) { return false; }
        return (storedData.users[userID].bitfield & worked) == worked
    }
    static SetUserWorkedStatus(userID, boolean)
    {
        if(!this.CheckIfUserHasBitfield(userID))
            this.AddBitfieldToUser(userID);
        
        if(boolean)
            storedData.users[userID].bitfield = storedData.users[userID].bitfield | worked
        else
            storedData.users[userID].bitfield = storedData.users[userID].bitfield & (fullBitfield ^ worked)
    }
    static SetWorkedStatusOfAll(boolean)
    {
        const userIDs = Object.keys(storedData.users);        
        for(let i = 0; i < userIDs.length; i++){  // loop through all users
            if(this.GetUserWorkedStatus(userIDs[i]) == !boolean)
            {
                this.SetUserWorkedStatus(userIDs[i], boolean);
            }
        }
    }

    // Worked Manager
    static GetUserWorkedManagerStatus(userID)
    {
        if(!this.CheckIfUserHasBitfield(userID)) { return false; }
        return (storedData.users[userID].bitfield & workedManager) == workedManager
    }
    static SetUserWorkedManagerStatus(userID, boolean)
    {
        if(!this.CheckIfUserHasBitfield(userID))
            this.AddBitfieldToUser(userID);
        
        if(boolean)
        {
            this.SetUserWorkedStatus(userID, true);
            storedData.users[userID].bitfield = storedData.users[userID].bitfield | workedManager
        }
        else
            storedData.users[userID].bitfield = storedData.users[userID].bitfield & (fullBitfield ^ workedManager)
    }
    static SetWorkedManagerStatusOfAll(boolean)
    {
        const userIDs = Object.keys(storedData.users);        
        for(let i = 0; i < userIDs.length; i++){  // loop through all users
            if(this.GetUserWorkedManagerStatus(userIDs[i]) == !boolean)
            {
                this.SetUserWorkedManagerStatus(userIDs[i], boolean);
            }
        }
    }
    static GetAllOfficeManagerIDs()
    {
        const userIDs = Object.keys(storedData.users);
        var workedManager = new Array();
        for(let i = 0; i < userIDs.length; i++)
        {
            if(this.GetUserWorkedManagerStatus(userIDs[i]) == true)
            {
                workedManager.push(userIDs[i]);
            }
        }
        return workedManager;
    }

    // Pimped
    static GetPimpedStatus(userID)
    {
        if(!this.CheckIfUserHasBitfield(userID)) { return false; }
        return (storedData.users[userID].bitfield & pimped) == pimped
    }
    static SetPimpedStatus(userID, boolean)
    {
        if(!this.CheckIfUserHasBitfield(userID))
            this.AddBitfieldToUser(userID);

        if(boolean)
            storedData.users[userID].bitfield = storedData.users[userID].bitfield | pimped
        else
            storedData.users[userID].bitfield = storedData.users[userID].bitfield & (fullBitfield ^ pimped)
    }
    static SetPimpedStatusOfAll(boolean)
    {
        const userIDs = Object.keys(storedData.users);        
        for(let i = 0; i < userIDs.length; i++){  // loop through all users
            if(this.GetPimpedStatus(userIDs[i]) == !boolean)
            {
                this.SetPimpedStatus(userIDs[i], boolean);
            }
        }
    }
    
}
module.exports.Bitfield = Bitfield;

class Gamble 
{
    static CheckIfUserHasGambleStats(userID)
    {
        return CheckIfUserIsInJSON(userID) && storedData.users[userID].gambleWon != null && storedData.users[userID].gambleLost != null;
    }
    static AddGambleStatsToUser(userID)
    {
        if(this.CheckIfUserHasGambleStats(userID)) { return; }
        storedData.users[userID].gambleWon = 0;
        storedData.users[userID].gambleLost = 0;
        console.log(`${Date()} : ${userID} has had their gamble stats assigned`);
    }

    static GetGambleWonOfUser(userID)
    {
        if(!CheckIfUserIsInJSON(userID) || !storedData.users[userID].gambleWon)
            return 0;
        return storedData.users[userID].gambleWon;
    }
    static SetGambleWonOfUser(userID, amount)
    {
        if(!this.CheckIfUserHasGambleStats(userID))
            this.AddGambleStatsToUser(userID);
        storedData.users[userID].gambleWon = amount;
        return amount;
    }
    static ChangeGambleWonOfUser(userID, amount)
    {
        if(!this.CheckIfUserHasGambleStats(userID))
            this.AddGambleStatsToUser(userID);

        return this.SetGambleWonOfUser(userID, this.GetGambleWonOfUser(userID) + parseInt(amount));
    }

    static GetGambleLostOfUser(userID)
    {
        if(!CheckIfUserIsInJSON(userID) || !storedData.users[userID].gambleLost)
            return 0;
        return storedData.users[userID].gambleLost;
    }
    static SetGambleLostOfUser(userID, amount)
    {
        if(!this.CheckIfUserHasGambleStats(userID))
            this.AddGambleStatsToUser(userID);
        storedData.users[userID].gambleLost = amount;
        return amount;
    }
    static ChangeGambleLostOfUser(userID, amount)
    {
        if(!this.CheckIfUserHasGambleStats(userID))
            this.AddGambleStatsToUser(userID);

        return this.SetGambleLostOfUser(userID, this.GetGambleLostOfUser(userID) + parseInt(amount));
    }

    static GetLeverPulls(userID)
    {
        if(!CheckIfUserIsInJSON(userID) || !storedData.users[userID].leverPulls)
            return 0;
        return storedData.users[userID].leverPulls;
    }
    static IncrementLeverPulls(userID)
    {
        if(!CheckIfUserIsInJSON(userID)) { AddUserToJSON(userID) }
        if(!storedData.users[userID].leverPulls)
            storedData.users[userID].leverPulls = 0;
        storedData.users[userID].leverPulls++;
    }
}
module.exports.Gamble = Gamble;

class GambleStats
{
    // Coinflip
    static ChangeCoinflipPayinByAmount(amount)
    {
        if(isNaN(parseInt(amount))) { return; }
        storedData.gamble['coinflip'].payin += parseInt(amount);
    }
    static ChangeCoinflipPayoutByAmount(amount)
    {
        if(isNaN(parseInt(amount))) { return; }
        storedData.gamble['coinflip'].payout += parseInt(amount);
    }

    // Higher or lower
    static ChangeHigherOrLowerPayinByAmount(amount)
    {
        if(isNaN(parseInt(amount))) { return; }
        storedData.gamble['highorlower'].payin += parseInt(amount);
    }
    static ChangeHigherOrLowerPayoutByAmount(amount)
    {
        if(isNaN(parseInt(amount))) { return; }
        storedData.gamble['highorlower'].payout += parseInt(amount);
    }

    // Slots
    static ChangeSlotsPayinByAmount(amount)
    {
        if(isNaN(parseInt(amount))) { return; }
        storedData.gamble['slots'].payin += parseInt(amount);
    }
    static ChangeSlotsPayoutByAmount(amount)
    {
        if(isNaN(parseInt(amount))) { return; }
        storedData.gamble['slots'].payout += parseInt(amount);
    }

    // Blackjack
    static ChangeBlackjackPayinByAmount(amount)
    {
        if(isNaN(parseInt(amount))) { return; }
        storedData.gamble['blackjack'].payin += parseInt(amount);
    }
    static ChangeBlackjackPayoutByAmount(amount)
    {
        if(isNaN(parseInt(amount))) { return; }
        storedData.gamble['blackjack'].payout += parseInt(amount);
    }
}
module.exports.GambleStats = GambleStats;

class Work
{
    static GetNumberOfWorkersWorked()
    {
        return storedData.workersWorked;
    }
    static IncrementWorkersWorker()
    {
        storedData.workersWorked += 1;
    }
    static ResetNumberOfWorkersWorked()
    {
        storedData.workersWorked = 0;
    }
}
module.exports.Work = Work;

class Waifu extends GuildData
{
    constructor(guildID)
    {
        super(guildID);
    }

    GetWaifuOwnerID(waifuID)
    {
        if(!this.CheckIfUserHasGuildData(waifuID)) { return null; }
        return storedData.guilds[this.guildID].users[waifuID].waifuOwner;
    }
    SetWaifuOwnerID(waifuID, ownerID)
    {
        if(!this.CheckIfUserHasGuildData(waifuID)) { this.AddUserToGuild(waifuID) }
        if(ownerID == null)
        {
            delete storedData.guilds[this.guildID].users[waifuID].waifuOwner;
        }
        else
        {
            storedData.guilds[this.guildID].users[waifuID].waifuOwner = ownerID;
        }
    }

    GetWaifuValue(userID)
    {
        if(!this.CheckIfUserHasGuildData(userID)) { return null; }
        return storedData.guilds[this.guildID].users[userID].waifuValue;
    }
    SetWaifuValue(userID, priceToSet)
    {
        if(!this.CheckIfUserHasGuildData(userID)) { this.AddUserToGuild(userID) }
        if(priceToSet == null)
        {
            delete storedData.guilds[this.guildID].users[userID].waifuValue;
        }
        else
        {
            storedData.guilds[this.guildID].users[userID].waifuValue = priceToSet;
        }
    }

    GetAllWaifuIDsOfOwnerID(ownerID)
    {
        const userIDs = Object.keys(storedData.guilds[this.guildID].users);
        var owned = new Array();
        for(let i = 0; i < userIDs.length; i++)
        {
            if(this.GetWaifuOwnerID(userIDs[i]) == ownerID)
            {
                owned.push(userIDs[i]);
            }
        }
        return owned;
    }

    GetAllWaifuUsernamesOfOwnerID(ownerID)
    {
        const userIDs = Object.keys(storedData.guilds[this.guildID].users);
        var owned = new Array();
        for(let i = 0; i < userIDs.length; i++)
        {
            if(this.GetWaifuOwnerID(userIDs[i]) === ownerID)
            {
                owned.push(GetUsernameOfUserID(userIDs[i]));
            }
        }
        return owned;
    }

    GetWaifusOnMarket()
    {
        const userIDs = Object.keys(storedData.guilds[this.guildID].users);
        var market = new Array();
        for(let i = 0; i < userIDs.length; i++)
        {
            if(this.GetWaifuOwnerID(userIDs[i]) == null && this.GetWaifuValue(userIDs[i]) != null)
            {
                market.push(`<@${userIDs[i]}> - \`${this.GetWaifuValue(userIDs[i])}\``)
            }
        }
        return market;
    }
}
module.exports.Waifu = Waifu;

class Activity
{
    static GetActivity()
    {
        return config.activity;
    }

    static SetText(newText)
    {
        config.activity.text = newText;
        SaveConfig();
    }
    static SetType(newType)
    {
        config.activity.type = newType;
        SaveConfig();
    }
    static SetURL(newURL)
    {
        config.activity.url = newURL;
        SaveConfig();
    }
}
module.exports.Activity = Activity;

class VoteKick
{
    static AddVoteKicked(userID, channelID, timeoutExpires)
    {
        if(storedData.voteKicked[userID] == null)
        {
            storedData.voteKicked[userID] = {};
            storedData.voteKicked[userID][channelID] = timeoutExpires
            return true;
        }
        if(!Object.keys(storedData.voteKicked[userID]).includes(channelID))
        {
            storedData.voteKicked[userID][channelID] = timeoutExpires;
            return true;
        }
        else
        { 
            return false; 
        }
    }
    static RemoveVoteKicked(userID, channelID)
    {
        if(storedData.voteKicked[userID] == null){ return false; }
        if(storedData.voteKicked[userID][channelID] == null)
        {
            return false;
        }
        delete storedData.voteKicked[userID][channelID];
        if(Object.keys(storedData.voteKicked[userID]).length == 0)
        {
            delete storedData.voteKicked[userID];
        }
        return true;
    }

    static KickedFromChannel(userID, channelID)
    {
        if(storedData.voteKicked[userID] == null) { return false; }
        const expiresAt = storedData.voteKicked[userID][channelID];
        if(expiresAt < Date.now())
        {
            this.RemoveVoteKicked(userID, channelID);
            return false;
        }
        return true;
    }

    static GetVoteKickTimeExpires(userID, channelID)
    {
        if(storedData.voteKicked[userID] == null){ return false; }
        return storedData.voteKicked[userID][channelID]
    }

    static AddTimeToTimeout(userID, channelID, timeinMS)
    {
        if(storedData.voteKicked[userID] == null) { return false; }
        if(storedData.voteKicked[userID][channelID] == null) { return false; }
        storedData.voteKicked[userID][channelID] += timeinMS;
        return true
    }

    static ClearVoteKickData()
    {
        storedData.voteKicked = {};
    }
}
module.exports.VoteKick = VoteKick;