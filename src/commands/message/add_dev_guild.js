const Data = require("../../util/user_data.js");
const { IsDevGuild } = require("../../util/helper_no_dependents.js");

module.exports = {
	name: "adddevguild",
	description: "Add a guild to the dev guild list",
	permission: 4,
	devGuildOnly: false,
    parameters: `[(optional) guild ID]`,
	async execute(message) {
        const messageContent = message.content.split(' ');
        let guild = message.guild.id;
        if(messageContent[1] != null)
        {
            guild = messageContent[1];
        }
        if(IsDevGuild(guild))
        {
            return message.reply(`\`${guild}\` is already in the dev guild list.`);
        }
        else
        {
            Data.AddGuildToDevGuilds(guild);
            return message.reply(`\`${guild}\` has been added to the dev guild list.`)
        }
	},
};
