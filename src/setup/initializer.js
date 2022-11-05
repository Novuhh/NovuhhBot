const readline = require("readline");
const fs = require('fs');
const { Client } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Helper = require('../util/helper_no_dependents.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('WARNING: After completing the initialization any previous instances of config.json, feedback.json, and user_data.json will be deleted. (backups folder will not be deleted.) Save your data now if you want to keep it.\n');

function input(prompt) {
    return new Promise((callbackFn, errorFn) => {
        rl.question(prompt, (uinput)=> {
            callbackFn(uinput);
        }, ()=> {
            errorFn();
        });
    });
}

const main = async () => {
    token = await input("Enter your bot's token: ");
    console.log(`Token: "${token}"\n`);
    devs = await input("Enter the discord id of any devlopers (multiple seperated by a space): ");
    let devArray = devs.split(' ');
    if(devs == ""){ devArray = []; }
    console.log(`Developer IDs: ${devArray.join(', ')}\n`);
    devGuilds = await input("Enter the discord server id of any developer guilds (multiple seperated by a space): ");
    let devGuildsArray = devGuilds.split(' ');
    if(devGuilds == ""){ devGuildsArray = []; }
    console.log(`Developer guilds: ${devGuildsArray.join(', ')}\n`);

    let statusConfirm = "";
    while(!(statusConfirm == "yes" || statusConfirm == "y" || statusConfirm == "no" || statusConfirm == "n"))
    {
        statusConfirm = (await input("Initalize bot status? (Y/N)")).toLowerCase();
    }
    let activity = {text: "", type: -1, url: ""};
    if(statusConfirm == "yes" || statusConfirm == "y")
    {
        activity.text = await input("\nEnter the status text of the bot: ");
        console.log(`Staus text: ${activity.text}\n`);

        while(!(activity.type == 1 || activity.type == 2 || activity.type == 3 || activity.type == 4 || activity.type == 5))
        {
            activity.type = parseInt(await input("Select your activity type: Playing(1), Streaming(2), Listening(3), Watching(4), or Competing(5). (1/2/3/4/5) "));
            if(activity.type <= 4)
                activity.type--;
        }

        while(true)
        {
            let temp = (await input("Enter a YouTube or Twitch URL. This only displays when activity type is streaming and is required to display. If not streaming then optional Leave blank to skip. ")).toLowerCase();
            if(temp == "")
            {
                console.log(`No activity url set.\n`)
                break;
            }
            else if(Helper.CheckIfValidStreamingUrl(temp))
            {
                console.log(`Activity URL set: ${temp}\n`);
                activity.url = temp;
                break;
            }
            else
            {
                console.log(`${temp} is an invalid URL. Valid URL examples: https://www.youtube.com/watch?v=fIRxrMGyYXU or https://www.twitch.tv/notnovuhh`);
            }
        }
    }

    let confirm = "";
    while(!(confirm == "yes" || confirm == "y" || confirm == "no" || confirm == "n"))
    {
        confirm = (await input("\nConfirm these setting? This will reset and overwrite config.json, feedback.json, and user_data.json. (Y/N) ")).toLowerCase();
    }
    if(confirm == "no" || confirm == "n")
    {
        console.log('Initialization aborted. No changes have been made');
    }
    else
    {
        // config.json
        let configData = {};
        configData.token = token;
        const client = new Client({ intents: [] });
        try{ await client.login(token); }
        catch(err){
            console.log(`\n${err}\nAborting initialization.`);
            rl.close();
            return;
        }
        client.destroy();
        console.log("Token validated")
        configData.activity = activity;
        configData.devIDs = devArray;
        configData.devGuilds = devGuildsArray;
        const configStringified = JSON.stringify(configData, null, 2);
        
        // feedback.json
        let feedbackData = [];
        const feedbackStringified = JSON.stringify(feedbackData, null, 2);
        
        // user_data.json
        let userData = {};
        userData.workersWorked = 0;
        userData.gamble = { coinflip: { payin: 0, payout: 0 }, highorlower: { payin: 0, payout: 0 }, slots: { payin: 0, payout: 0 }, blackjack: { payin: 0, payout: 0 }};
        userData.voteKicked = {};
        userData.users = {};
        userData.guilds = {};
        const userStringified = JSON.stringify(userData, null, 2);

        // Must make sure all files are written
        // Solution is cringe but it works
        // All files must be witten to before able to deploy slash commands
        fs.writeFile('./src/data/config.json', configStringified, (err) => {
            if(err){ console.log(`\n${err}\nAborting initialization.`); }
            else
            { 
                console.log("\nconfig.json written successfully"); 
                fs.writeFile('./src/data/feedback.json', feedbackStringified, (err) => {
                    if(err){ console.log(`\n${err}\nAborting initialization.`); }
                    else{ 
                        console.log("feedback.json written successfully"); 
                        fs.writeFile('./src/data/user_data.json', userStringified, (err) => {
                            if(err){ console.log(`\n${err}\nAborting initialization.`); }
                            else{ 
                                console.log("user_data.json written successfully\n");
                                const { DeploySlashCommands } = require("../deploy-commands-module.js")
                                DeploySlashCommands();
                            }
                        });
                    }
                });
            }
        });
    }
    rl.close();
};

main();