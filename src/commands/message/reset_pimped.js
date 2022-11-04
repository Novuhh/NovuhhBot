const Data = require("../../util/user_data.js");

module.exports = {
    name: "resetpimped",
    description: "Reset the pimped status of a user",
    permission: 4,
    devGuildOnly: false,
    async execute(message) {
        const user = message.mentions.users.first();
        if(user)
        {
            Data.Bitfield.SetPimpedStatus(user.id, false);
            return message.channel.send({content: `Reset the pimped status of ${user}`, allowedMentions: { repliedUser: false }});
        }
        Data.Bitfield.SetPimpedStatusOfAll(false);
        return message.channel.send(`Reset the pimped status of all users.`);
    },
};