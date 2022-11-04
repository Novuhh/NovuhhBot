const { SlashCommandBuilder } = require('@discordjs/builders');
const Data = require("../../util/user_data.js")
const { bannedPhraseCharLimit } = require('../../data/constants.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modify_banned_words')
		.setDescription('modify the banned words')
        .addSubcommand(subcommand => subcommand
            .setName('phrase')
            .setDescription('Modify the banned phrases')
            .addStringOption(option => option
                .setName('add_or_remove')
                .setDescription('Add or Remove the banned phrase')
                .setRequired(true)
                .addChoices([
                    ['add', 'add'],
                    ['remove', 'remove']
                ])
            )
            .addStringOption(option => option
                .setName('phrase')
                .setDescription('The phrase to add or remove')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('delete')
            .setDescription('Modify if the orginal message is deleted or not')
            .addBooleanOption(option => option
                .setName('delete_orginal')
                .setDescription('Delete the message that contains a banned phrase?')
                .setRequired(true)
            )
        )
        
		.setDefaultPermission(false),
	async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildBlacklist = new Data.Blacklist(interaction.guild.id);

        if(subcommand == 'delete')
        {
            const blacklistDelete = interaction.options.getBoolean('delete_orginal')
            if(guildBlacklist.GetBlacklistDelete() == blacklistDelete)
            {
                return interaction.reply(`Delete message containing a banned phrase is already set to \`${blacklistDelete}\``);
            }
            else
            {
                guildBlacklist.SetBlacklistDelete(blacklistDelete);
                return interaction.reply(`Delete message containing a banned phrase is now set to \`${blacklistDelete}\``);
            }
        }

        const addOrRemove = interaction.options.getString('add_or_remove');
        const phrase = interaction.options.getString('phrase');

        const index = guildBlacklist.GetBlacklistArray().indexOf(phrase);

        if(addOrRemove == 'add')
        {
            if (index == -1)
            {
                if(phrase.length > bannedPhraseCharLimit) { return interaction.reply(`Max length for a phrase to ban is \`${bannedPhraseCharLimit}\` characters.`); }
                guildBlacklist.AddPhraseToBlacklist(phrase.toLowerCase());
                console.log(`${Date()} : ${interaction.user.username}[${interaction.user.id}] added the banned phrase "${phrase}" to the guild[${interaction.guild.id}] blacklist.`);
                return interaction.reply(`The phrase \`${phrase}\` has been added to the blacklist.`);
            }
            return interaction.reply(`The phrase \`${phrase}\` is already on the blacklist.`);
        }
        if(addOrRemove == 'remove')
        {
            if (index != -1) 
            {
                guildBlacklist.RemovePhraseFromBlacklist(phrase.toLowerCase());
                console.log(`${Date()} : ${interaction.user.username}[${interaction.user.id}] removed the banned phrase "${phrase}" from the guild[${interaction.guild.id}] blacklist.`);
                return interaction.reply(`The phrase \`${phrase}\` has been removed to the blacklist.`);
            }
            return interaction.reply(`The phrase \`${phrase}\` is not on the blacklist.`);
        }
        return interaction.reply('An error has occored please report this.')
	},
};
