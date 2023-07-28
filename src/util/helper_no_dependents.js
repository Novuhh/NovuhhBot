const { PermissionFlagsBits } = require('discord.js');

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
        return member.permissions.has(PermissionFlagsBits.Administrator);
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
    let hash = [];
    for(let i = 0; i < size; i++)
    {
        hash.push(characters[Math.floor(Math.random() * characters.length)]);
    }
    return hash.join('');
}

module.exports.GenerateUserHash = function(userID = "", size = 8)
{
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let hash = [userID, '_']
    for(let i = 0; i < size; i++)
    {
        hash.push(characters[Math.floor(Math.random() * characters.length)]);
    }
    return hash.join('');
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

// Depreciated
module.exports.DisableAllInteractionComponents = function(interaction)
{
    return "Called depreciated function: DisableAllInteractionComponents"
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

// From discord js Util. Deapritated in v14
module.exports.splitMessage = function(text, { maxLength = 2_000, char = '\n', prepend = '', append = '' } = {}) 
{
    if (typeof text !== 'string') throw new error(`Expected a string, got ${text} instead.`);
    if (text.length <= maxLength) return [text];
    let splitText = [text];
    if (Array.isArray(char)) {
      while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
        const currentChar = char.shift();
        if (currentChar instanceof RegExp) {
          splitText = splitText.flatMap(chunk => chunk.match(currentChar));
        } else {
          splitText = splitText.flatMap(chunk => chunk.split(currentChar));
        }
      }
    } else {
      splitText = text.split(char);
    }
    if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
    const messages = [];
    let msg = '';
    for (const chunk of splitText) {
      if (msg && (msg + char + chunk + append).length > maxLength) {
        messages.push(msg + append);
        msg = prepend;
      }
      msg += (msg && msg !== prepend ? char : '') + chunk;
    }
    return messages.concat(msg).filter(m => m);
}

module.exports.CheckLineInMatrix = function (matrix = [[]], toCheckFor = 0, lineLength = 4)
{
    let matrixCopy = JSON.parse(JSON.stringify(matrix));

    function CheckRows(matrix)
    {
        for (let i = 0; i < matrix.length; i++) 
        {
            for(let j = 0; j < matrix[i].length - lineLength + 1; j++)
            {
                if(matrix[i].slice(j, j + lineLength).every((x) => x == toCheckFor)) { return true; }
            }
        }
    }
    // Check rows for a line
    if(CheckRows(matrixCopy)) { return true; }
    // Switches Cols to rows, then checks for a line
    if(CheckRows(matrixCopy[0].map((_, colIndex) => matrixCopy.map(row => row[colIndex])))) { return true; }

    function CheckDiags(matrix)
    {
        for (let i = 0; i < matrix.length - lineLength + 1; i++) 
        {
            for(let j = 0; j < matrix[i].length - lineLength + 1; j++)
            {
                let tempList = []
                for(let k = 0; k < lineLength; k++)
                {
                    tempList.push(matrix[i + k][j + k]);
                }
                if(tempList.every((x) => x == toCheckFor)) { return true; }
            }
        }
    }
    // Check diags
    if(CheckDiags(matrixCopy)) { return true; }
    matrixCopy.every(x => x.reverse());
    if(CheckDiags(matrixCopy)) { return true; }
    return false;
}