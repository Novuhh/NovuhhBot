const Data = require("../../util/user_data.js");
const { IsDevGuild } = require("../../util/helper_no_dependents.js");
const { saysPropaganda } = require("../../data/constants.json");

module.exports =
{
    name: "dev guilds",
    execute(message)
    {
        if(!IsDevGuild(message.guild.id)){ return; }
        if(message.author.bot){ return; }

        if(Math.floor(Math.random() * 250) == 0)
        {
            setTimeout(function(){
                new Data.SocialCredit(message.guild.id).ChangeSocialCreditOfUserByAmount(message.member, saysPropaganda, message);
                message.channel.send(`Nice work \`${message.author.username}\` speading the ${message.guild.name} propagandist phrase of \`REDACTED\` enjoy the \`${saysPropaganda}\` social credit.`);
            }, (Math.floor(Math.random() * 540) + 60) * 1000);
        }
        return;
    }
}