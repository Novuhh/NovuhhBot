const Data = require("../../util/user_data.js")

module.exports = 
{
    name: "votekick",
    execute(oldVoiceState, newVoiceState)
    {
        if(newVoiceState.channel != null && Data.VoteKick.KickedFromChannel(newVoiceState.id, newVoiceState.channelId))
        {
            newVoiceState.disconnect();
        }
    }
}