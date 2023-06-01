const Data = require("../../util/user_data.js");

module.exports = {
	name: "modifysize",
	description: `Modify the "size" of someone`,
	permission: 3,
	devGuildOnly: false,
    parameters: `[@user] [(optional) new size]`,
	async execute(message) {
        const user = message.mentions.users.first();
        const messageContent = message.content.split(' ');
        const newSize = parseInt(messageContent[2]);
        if(user == null)
        {
            return message.channel.send(`Follow the proper format: ${new Data.GuildData(message.guild.id).GetPrefix()}modifysize [@user] [new_size]\nnew_size: is from \`-13\` (12 inch deep pussy) to \`12\` (12 inch long cock). \`-1\` is pussy of size 0. \`0\` is cock of size 0. Can be left blank to get a new random size.`);
        }
        const guildSize = new Data.Size(message.guildId);
        if(messageContent[2] == null)
        {
            guildSize.SetSizeOfUser(user.id, null);
            return message.channel.send({content:`${user} has had their size reevaluated. It is now \`${guildSize.GetSizeOfUser(user.id)}\`.`, allowedMentions: { repliedUser: false }});
        }
        if(12 < newSize || newSize < -13)
        {
            return message.channel.send(`Invalid Size. Size is from \`-13\` (12 inch deep pussy) to \`12\` (12 inch long cock). \`-1\` is pussy of size 0. \`0\` is cock of size 0.`);
        }
        guildSize.SetSizeOfUser(user.id, newSize);
        return message.channel.send({content: `${user} has had their size assigned to \`${newSize}\`.`, allowedMentions: { repliedUser: false }});
	},
};