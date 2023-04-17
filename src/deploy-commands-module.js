const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { token, clientId } = require('./data/config.json');

module.exports.DeleteGuildSlashCommands = async function(guildId)
{
	const rest = new REST({ version: '10' }).setToken(token);
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
	.then(() => console.log(`Successfully deleted all guild commands in guild[${guildId}].`))
	.catch(console.error);
	return;
}

module.exports.DeploySlashCommands = async function()
{
	console.log('Loading commands');
	const commands = [];
	const commandFiles = fs.readdirSync('./src/commands/slash').filter(file => file.endsWith('.js'))//.filter(file => !file.startsWith('test'));
	for (const file of commandFiles) {
		const command = require(`./commands/slash/${file}`);
		commands.push(command.data.toJSON());
	}
	console.log(`Successfully Loaded ${commands.length} commands`);

	console.log('Registering application commands');
	const rest = new REST({ version: '10' }).setToken(token);

    rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log(`Successfully registered [${commands.length}] application commands globally`))
    .catch(console.error);
}