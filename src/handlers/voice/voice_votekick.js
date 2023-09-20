const Data = require("../../util/user_data.js")

module.exports = 
{
    name: "votekick",
    execute(oldVoiceState, newVoiceState)
    {
        if(newVoiceState.channel != null && Data.VoteKick.KickedFromChannel(newVoiceState.id, newVoiceState.channelId))
        {
            Data.VoteKick.AddTimeToTimeout(newVoiceState.id, newVoiceState.channelId, 60 * 1000);
            newVoiceState.member.user.send(`You are currently kicked from ${newVoiceState.channel.name}. Adding 1 minute for trying. The kick ends <t:${Math.ceil(Data.VoteKick.GetVoteKickTimeExpires(newVoiceState.id, newVoiceState.channelId) / 1000)}:R>`)
            newVoiceState.disconnect();
        }
    }
}