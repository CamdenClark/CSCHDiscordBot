const Discord = require("discord.js");
const dotenv  = require("dotenv");
require("rolesHandler.js")();
require("resumeHandler.js")();
const client  = new Discord.Client();

const { map, filter }  = require("lodash");

var queue = [];

dotenv.config();

/* Yes, I know this is a mess. I'm just trying to get it functional, then
 * we can be more discerning about the quality of this code and how to
 * destructure it properly.
 **/

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    handleResume(msg);
    handleRoles(msg);
});

client.login(process.env.TOKEN_SECRET);
