const Data = require("../../util/user_data.js")

module.exports = 
{
    name: "votekick",
    execute(oldVoiceState, newVoiceState)
    {
        if(newVoiceState.channel != null && Data.VoteKick.KickedFromChannel(newVoiceState.id, newVoiceState.channelId))
        {
            newVoiceState.member.user.send(`You are currently kicked from ${newVoiceState.channel.name}. The kick last 15 minutes. Just wait it out if you really want to join back.`)
            newVoiceState.disconnect();
        }
    }
}