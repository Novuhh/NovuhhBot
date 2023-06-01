const Data = require('../../util/user_data.js');

module.exports = {
	name: "backup",
	description: "Backup the user data in its current state",
	permission: 4,
	devGuildOnly: false,
    parameters: `[(optional) backup file name]`,
	async execute(message) {
        let messageContent = message.content.split(' ');
        if(messageContent[1] == null)
        {
            Data.BackupJson();
            return message.reply(`Backed up user data.`);
        }
        messageContent.splice(0, 1);
        Data.BackupJson(messageContent.join('_'));
        return message.reply(`Backed up user data with comment: \`${messageContent.join('_')}\``)   
	},
};
