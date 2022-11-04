const voiceChannel = '915691182401662999';
let nicknames = ['Walter White', 'Jesse Pinkman', 'Saul Goodman', 'I am the one who drinks', 'Mike Ehrmantraut', 'Walter White Jr.', 'Skyler White', 'Hank Schrader'];
let previousNicks = new Map()

module.exports = 
{
    name: "breaking bad rp",
    execute(oldVoiceState, newVoiceState)
    {
        if(newVoiceState.channel == voiceChannel && newVoiceState.channel != oldVoiceState.channel && newVoiceState.member.manageable)
        {
            previousNicks.set(newVoiceState.id, newVoiceState.member.nickname)
            newVoiceState.member.setNickname(nicknames[Math.floor(Math.random() * nicknames.length)], "RP time");
        }
        
        if(oldVoiceState.channel == voiceChannel && oldVoiceState.channel != newVoiceState.channel && oldVoiceState.member.manageable && previousNicks.has(oldVoiceState.id))
        {
            oldVoiceState.member.setNickname(previousNicks.get(oldVoiceState.id), "RP over");
            previousNicks.delete(oldVoiceState.id)
        }
    }
}