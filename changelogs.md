# Novuhh Discord Bot Changelogs

I will try and document the changes I make from the previous version

# 2.1.0

- Github release - This project has come far enough that I comfortable making this project open source. I may not follow all the perfect code practices but in its current state there is a possibilty that someone may find this code useful. Javascript is not the best language for documentation with no types for any variables or constants but I wil try to improve documentation going forward. I may understand my own code but for someone just opening the project, it may be hard to follow. In the future some code may be ported to typescript to help with this.
- Initializer - A simple way to get the bot ready by running one command. `npm run init` or by running the initializer at path `./src/setup/initializer.js`.
- Seperation of slash and message commands - Adding or taking away a command should be much easier with the modular system.
- Message and voice handlers - Also modular.
- File structure much more organized.
- Deploy slash commands - Quick and easy with `npm run dc`.
- Devs - Users with the dev permission have access to dev specific commands.
- Dev guilds - Now certain functions can be locked to certain guilds. For testing or just having a private command. Only works on message commands for now.
- Add and removing dev guilds - Need dev permission
- Embeds - Lots of embeds instead of standard discord messages. I should have done this after updating to discord js v14 but welp, too late now.
- /gamble_stats - Now avilable to everyone instead of just users with admin permssion
- /votekick - Now updates the count to only include those currently in the voice channel. If a person leaves then on the next update it will reflect that change.

# 2.1.2

- Updated from discord js v13.6.0 to v14.8.0
- Commands are now global instead of guild
    - Commands that aren't required to be used in a guild are now able to be used in direct messages. Ex: `/blackjack`
- New command: RPS, play rps with a friend, or let anyone play against you.
- Help command is now modular. Any new slash command added will automatically show in the help command. Message command support will be coming soon tm.

# 2.1.4

- Full modular help menu
- Minor fixes

# 2.1.5
- New command: Connect 4, play connect 4 with a friend, or let anyone play against you.
- New command: Timestamp, generate a discord timestamp that displays the correct time for everyone.
- Bug fixes

# 2.1.6
- Votekick reworked to ensure kick is removed
- Joining back a voice channel kicked from extends the time kicked
- Bug fixes