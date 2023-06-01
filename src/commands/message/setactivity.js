const Data = require("../../util/user_data.js");
const Helper = require("../../util/helper_functions.js");
const Helper2 = require("../../util/helper_no_dependents.js");
const typeMap = new Map([[-1,"None"],[0,"Playing"],[1,"Streaming"],[2,"Listening"],[3,"Watching"],[5,"Competing"]]);

module.exports = {
	name: "setactivity",
	description: "Set the activity presense of the bot",
	permission: 4,
	devGuildOnly: false,
	parameters: "[text, type, or url] [set to]",
	async execute(message) {
        const splitMessage =  message.content.split(' ');
		const prefix = new Data.GuildData(message.guildId).GetPrefix();
		const botName = message.client.user.username;
		
		let option = splitMessage[1];
		if(option != null){ option = option.toLowerCase(); }
		switch(option)
		{
			case "text":
				const newText = splitMessage.slice(2, splitMessage.length).join(' ');
				Data.Activity.SetText(newText);
				message.reply(`${botName} status text has been changed to: \`${newText}\``);
				return;

			case "type":
				let type = parseInt(splitMessage[2]);
				if(!typeMap.has(type))
				{
					message.reply(`Enter a valid type: ${prefix}setactivity type [set_to]\nSet to: None(-1), Playing(0), Streaming(1), Listening(2), Watching(3), or Competing(5)`);
					return;
				}
				Data.Activity.SetType(type);
				message.reply(`${botName} activity type has been set to: \`${typeMap.get(type)}\``);
				break;

			case "url":
				const url = splitMessage[2];
				if(url == null)
				{
					Data.Activity.SetURL("");
					message.reply(`${botName} activity url has been unset`);
					break;
				}
				if(Helper2.CheckIfValidStreamingUrl(url))
				{
					Data.Activity.SetURL(url);
					message.reply(`${botName} activity url has been set to: \`${url}\``);
					break;
				}
				message.reply(`Invalid url. ${prefix}setactivity url [URL]\nURL: \`https://www.youtube.com/watch?v=fIRxrMGyYXU\` or \`https://www.twitch.tv/notnovuhh\``);
				break;

			default:
				message.reply(`Invalid option. ${prefix}setactivity [option] [set_to]\nOptions: text, type, or url.\nSet to: What to set the option to`);
				break;
		}
		Helper.UpdateStatus(message.client);
	},
};
