const fs = require('node:fs');
const { Client } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('./data/config.json');

async function GetClientIdAndGuilds(client)
{
	if(client == null){ client = new Client({ intents: [] }); }
    try{ await client.login(token); }
    catch(err){
        console.log(`\n${err}\nAborting deploying slash commands`);
        return [];
    }
	const guilds = Array.from(client.guilds.cache.keys());
	const clientID = client.user.id;
    client.destroy();
	return [clientID, guilds];
}

module.exports.DeploySlashCommandsToGuild = function(guildId, client)
{
	const [clientID] = GetClientIdAndGuilds(client);
	const commands = [];
	const commandFiles = fs.readdirSync('./src/commands/slash').filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/slash/${file}`);
		commands.push(command.data.toJSON());
	}

	const rest = new REST({ version: '9' }).setToken(token);
	rest.put(Routes.applicationGuildCommands(clientID, guildId), { body: commands })
	.catch(console.error);
    console.log(`${Date()} : Deployed slash commands to guild ${guildId}`);
}

module.exports.DeploySlashCommands = async function(client)
{
	console.log('Getting clientId and guildIds');
	const [clientID, guilds] = await GetClientIdAndGuilds(client);
	console.log(`${guilds.length} guild ids found`);

	console.log('Loading commands');
	const commands = [];
	const commandFiles = fs.readdirSync('./src/commands/slash').filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/slash/${file}`);
		commands.push(command.data.toJSON());
	}
	console.log(`Successfully Loaded ${commands.length} commands`);

	console.log('Registering application commands');
	const rest = new REST({ version: '9' }).setToken(token);
	for(let guildId of guilds)
    {
        rest.put(Routes.applicationGuildCommands(clientID, guildId), { body: commands })
        .catch(console.error);
    }
	console.log(`Successfully registered [${commands.length}] application commands to all[${guilds.length}] guilds`);
}