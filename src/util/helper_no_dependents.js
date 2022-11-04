module.exports.IsDevUser = function(userID)
{
    const { GetDevUsers } = require('../util/user_data.js');
    return GetDevUsers().includes(userID);
}

module.exports.IsDevGuild = function(guildID)
{
    const { GetDevGuilds } = require('../util/user_data.js');
    return GetDevGuilds().includes(guildID);
}

module.exports.IsAdmin = function(member)
{
    try {
        return member.permissions.serialize().ADMINISTRATOR;
    } catch (e) {
        console.log(`${Date()} : A message check for IsAdmin failed.\nError message: ${e}`);
    }
    return false;
}

module.exports.RollDie = function(sides)
{
    return Math.ceil(Math.random() * sides);
}

module.exports.RollDice = function(amount, sides)
{
    var total = 0;
    for(let i = 0; i < amount; i++)
    {
        total += this.RollDie(sides)
    }
    return total;
}

module.exports.ShuffleArray = function(array) 
{
    var tmp, current, top = array.length;
    if(top) while(--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
    }
    return array;
}

module.exports.NumberOfValueInArray = function(array, value)
{
    var count = 0;
    for(index = 0; index < array.length; index++)
        if(array[index] == value)
            count++;
    return count;
}

module.exports.CheckIfValidStreamingUrl = function(url) 
{
    const youtubeRegex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    const twitchRegex =  /^(?:https?:\/\/)?(?:m\.|www\.)?(?:\/|twitch\.tv\/)?[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if(url.match(youtubeRegex) || url.match(twitchRegex))
    {
        return true;
    }
    return false;
}

module.exports.GenerateRandomHash = function(size = 16)
{
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let hash = '';
    for(let i = 0; i < size; i++)
    {
        hash += characters[Math.floor(Math.random() * characters.length)];
    }
    return hash;
}

module.exports.GenerateUserHash = function(userID = "", size = 8)
{
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let i = 0; i < size; i++)
    {
        userID += characters[Math.floor(Math.random() * characters.length)];
    }
    return userID;
}

const runEveryFullMinute = (callbackFn) => {
    const seconds = 60 * 1000;
    const currentDate = new Date();
    const firstCall =  seconds - (currentDate.getSeconds()) * 1000 - currentDate.getMilliseconds();
    setTimeout(() => {
        callbackFn();
        setInterval(callbackFn, seconds);
    }, firstCall);
};

module.exports.DisableAllInteractionComponents = function(interaction)
{
    interaction.fetchReply().then(reply => {
        for(let row of reply.components)
        {
            for(let component of row.components)
            {
                component.setDisabled(true);
            }
        }
        interaction.editReply({ components: reply.components });
    });
}
