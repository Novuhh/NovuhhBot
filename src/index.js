const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./data/config.json');
const Data = require('./util/user_data.js')
const Helper = require('./util/helper_functions.js');
const NoDependents = require('./util/helper_no_dependents.js');
const SlashCommands = require('./deploy-commands-module.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS] });

// Slash commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands/slash').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/slash/${file}`);
	client.commands.set(command.data.name, command);
}

// Message commands
client.messageCommands = new Collection();
const messageCommandFiles = fs.readdirSync('./src/commands/message').filter(file => file.endsWith('.js'));
for (const file of messageCommandFiles){
   const command = require(`./commands/message/${file}`);
   client.messageCommands.set(command.name, command);
}

// Message handlers
const messageHandlersFiles = fs.readdirSync('./src/handlers/message').filter(file => file.endsWith('.js'));
const messageHandlers = new Map();
for (const file of messageHandlersFiles){
    const handler = require(`./handlers/message/${file}`);
    messageHandlers.set(handler.name, handler);
}

// Voice handlers
const voiceHandlersFiles = fs.readdirSync('./src/handlers/voice').filter(file => file.endsWith('.js'));
const voiceHandlers = new Map();
for (const file of voiceHandlersFiles){
    const handler = require(`./handlers/voice/${file}`);
    voiceHandlers.set(handler.name, handler);
}

// On startup
client.once('ready', () => {
	Helper.UpdateStatus(client);
	runEveryFullHour(() => Data.SaveToJson());
	runEveryFullDay(() => Helper.RunEveryDay(client));
	console.log(`${Date()} : ${client.user.username} is online!`);
});

// On exit
process.on('SIGINT', () => process.exit(0));
process.on('exit', () => {
    Data.VoteKick.ClearVoteKickData();
	Data.SaveToJson();
	console.log(`${Date()} : ${client.user.username} is shutting down`);
});

client.on('interactionCreate', async interaction => {
	if(interaction.isCommand()) 
	{
		const command = client.commands.get(interaction.commandName);
		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
	return;
});

client.on("messageCreate", async message => {
    messageHandlers.forEach(handler => handler.execute(message));

    const prefix = new Data.GuildData(message.guild.id).GetPrefix();
    if(!message.content.startsWith(prefix)){ return; }    // No prefix detected, do not care
    const commandText = message.content.split(' ')[0].substring(prefix.length).toLowerCase();

    if(client.messageCommands.has(commandText))
    {
        const command = client.messageCommands.get(commandText);
        if(!command) return;

        // If dev guild only command check if in dev guild
        if(command.devGuildOnly == true && !NoDependents.IsDevGuild(message.guild.id)){ return; }
        
        // Check the user has permission to use the command
        switch(command.permission)
        {
            case 0:
                return;
            case 1:
                break;
            case 2:
                if(NoDependents.IsAdmin(message.member))
                    break;
                return;
            case 3:
                if(message.author.id == message.guild.ownerId)
                    break;
                return;
            case 4:
                if(NoDependents.IsDevUser(message.author.id))
                    break;
                return;
            default:
                return
        }

        try{
            await command.execute(message);
        } catch (error) {
            console.error(error);
            await message.reply('There was an error while executing this command!')
        }
    }
});

client.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => {
    voiceHandlers.forEach(handler => handler.execute(oldVoiceState, newVoiceState));    
});

client.on('guildCreate', guild => {
    Data.AddGuildToJson(guild.id);
    SlashCommands.DeploySlashCommandsToGuild(guild.id, client);
});

client.on('guildDelete', guild => {
    Data.RemoveGuildFromJson(guild.id);
})

client.login(token);


const runEveryFullMinute = (callbackFn) => {
    const seconds = 60 * 1000;
    const currentDate = new Date();
    const firstCall =  seconds - (currentDate.getSeconds()) * 1000 - currentDate.getMilliseconds();
    setTimeout(() => {
        callbackFn();
        setInterval(callbackFn, seconds);
    }, firstCall);
};

const runEveryFullTenMinutes = (callbackFn) => {
    const tenMin = 10 * 60 * 1000;
    const currentDate = new Date();
    const firstCall =  tenMin - ((currentDate.getMinutes() % 10) * 60 + currentDate.getSeconds()) * 1000 - currentDate.getMilliseconds();
    setTimeout(() => {
        callbackFn();
        setInterval(callbackFn, tenMin);
    }, firstCall);
};

const runEveryFullHour = (callbackFn) => {
    const hour = 60 * 60 * 1000;
    const currentDate = new Date();
    const firstCall =  hour - ((currentDate.getMinutes()) * 60 + currentDate.getSeconds()) * 1000 - currentDate.getMilliseconds();
    setTimeout(() => {
        callbackFn();
        setInterval(callbackFn, hour);
    }, firstCall);
};

const runEveryFullDay = (callbackFn) => {
    const day = 24 * 60 * 60 * 1000;
    const currentDate = new Date();
    const firstCall = day - ((currentDate.getHours() * 60 + currentDate.getMinutes()) * 60 + currentDate.getSeconds()) * 1000 - currentDate.getMilliseconds();
    setTimeout(() => {
        callbackFn();
        setInterval(callbackFn, day);
    }, firstCall);
};