const { Client } = require('discord.js');
const { DeploySlashCommands, DeleteGuildSlashCommands } = require("../deploy-commands-module.js")
const { token } = require("../data/config.json")

// Remove all guild commands
const main = async () =>
{
    console.log('Attempting to update from 2.1.0 to 2.1.2');
    const client = new Client({ intents: [] });
    try{ await client.login(token); }
    catch(err){
        console.log(`\n${err}\nInvalid Token`);
        return;
    }
    const guilds = await client.guilds.fetch();
    client.destroy();    
    console.log('Removing old guild commands')

    let keys = Array.from( guilds.keys() );
    const promises = keys.map(async key => { await DeleteGuildSlashCommands(key) }) 
    await Promise.all(promises).then(() => console.log("Removed guild commands from all guilds"));
    
    // Deploy global commands
    console.log('Deploying global commands');
    await DeploySlashCommands();

    console.log('Succesfully updated from 2.1.0 to 2.1.2');
    return;
}

main();