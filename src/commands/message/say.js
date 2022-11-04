module.exports = {
	name: "say",
	description: "Repeat the message without the say",
	permission: 4,
	devGuildOnly: false,
	async execute(message) {
        const messageContent = message.content.split(' ');
        message.delete();
        if(messageContent[1] != null) 
        {
            return message.channel.send(messageContent.splice(1).join(' '));
        }
        return message.channel.send("Gotta put what you want me to say afterwards retard.");
	},
};
