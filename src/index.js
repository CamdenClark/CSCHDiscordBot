const Discord = require("discord.js");
const dotenv  = require("dotenv");

const handleRoles  = require("./rolesHandler.js");
const handleResume = require("./resumeHandler.js");

const client  = new Discord.Client();

var queue = [];

dotenv.config();
const productionEnv = process.env.ENVIRONMENT === "DEV" ? false : true;

/* Yes, I know this is a mess. I'm just trying to get it functional, then
 * we can be more discerning about the quality of this code and how to
 * destructure it properly.
 **/

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    handleResume(msg, productionEnv);
    handleRoles(msg, productionEnv);
});

client.login(process.env.TOKEN_SECRET);
