# ResumeDiscordBot
A discord bot to facilitate resume reviewing, role assignment, and interview scheduling on the Twitch Plays Programming Discord server

## Installation for development

1. Clone this repository.
2. [Install mongo](https://docs.mongodb.com/v3.4/administration/install-on-linux/) and make sure you have the mongodb service running.
3. Create a .env file similar to .env.example that has your bot token in it. Also add the mongo server URI with what database you're using.
4. Run ```npm install```.
5. Run ```npm start```.

## Roadmap

1. Refactor this project well. We should probably have a utils folder.
2. Set up a system for controlling interviews. We have a shell for this but it's severely lacking. We'll need to hook this up to the mongodB server as well. We should consider using [moment.js](http://momentjs.com) for some of this stuff.
