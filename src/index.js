const Discord = require("discord.js");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

queue = [];

const handleRoles = require("./rolesHandler.js");
const handleResume = require("./resumeHandler.js");
const handleTimezone = require("./timezone");
//const handleResume = require("./interviewScheduler.js");

client = new Discord.Client();

dotenv.config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});

mongoose.connection.on("error", () => {
    console.log("MongoDB failed.");
    process.exit();
});

const productionEnv = !(process.env.ENVIRONMENT === "DEV");

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
    handleTimezone(msg);
});

client.login(process.env.TOKEN_SECRET);
