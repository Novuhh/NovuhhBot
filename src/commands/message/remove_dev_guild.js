const Data = require("../../util/user_data.js");
const { IsDevGuild } = require("../../util/helper_no_dependents.js");

module.exports = {
	name: "removedevguild",
	description: "Add a guild to the dev guild list",
	permission: 4,
	devGuildOnly: false,
	async execute(message) {
        const messageContent = message.content.split(' ');
        let guild = message.guild.id;
        if(messageContent[1] != null)
        {
            guild = messageContent[1];
        }
        if(!IsDevGuild(guild))
        {
            return message.reply(`\`${guild}\` is not in the dev guild list.`);
        }
        else
        {
            Data.RemoveGuildFromDevGuilds(guild);
            return message.reply(`\`${guild}\` has been removed from the dev guild list.`)
        }
	},
};
