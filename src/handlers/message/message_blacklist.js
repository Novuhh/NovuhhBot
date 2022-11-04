const Data = require("../../util/user_data.js")
const Discord = require('discord.js');
const { IsAdmin } = require('../../util/helper_no_dependents.js');
const { credLostPerBlacklistPhrase } = require('../../data/constants.json');

module.exports =
{
    name: "blacklist",
    execute(message)
    {
        if(message.author.bot){ return; }

        if(!IsAdmin(message.member))
        {
            const guildBlacklist = new Data.Blacklist(message.guildId);
            if(guildBlacklist.GetBlacklistArray().length == 0) { return; }
            const messageConent = message.content.toLowerCase();
            const infractions = guildBlacklist.CheckStringForBlacklistedPhrases(messageConent);
            if(infractions != 0)
            {
                if(guildBlacklist.GetBlacklistDelete()) { message.delete(); }
                new Data.SocialCredit(message.guildId).ChangeSocialCreditOfUserByAmount(message.member, -credLostPerBlacklistPhrase * infractions, message);
                message.channel.send(`\`${message.author.username}\` has said the blacklisted phrase of \`REDACTED\` \`${infractions}\` time(s) and lost \`${credLostPerBlacklistPhrase*infractions}\` social credit because of it.`);
            }
        }
    }
}