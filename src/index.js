const Discord = require("discord.js");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

queue = [];

const handleRoles = require("./rolesHandler");
const handleResume = require("./resumeHandler");
const handleTimezone = require("./timezone");
const handleInspiration = require("./inspirationHandler");
const handleInterview = require("./interviewScheduler");

const Waitlist = require("../models/interviewWaitlistModel");

client = new Discord.Client();

dotenv.config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});

mongoose.connection.on("error", () => {
    console.log("MongoDB failed.");
    process.exit();
});

productionEnv = !(process.env.ENVIRONMENT === "DEV");

setInterval(() => {
    Waitlist.find({warn: false}).then((users) => {
        users.forEach((user) => {
            if (Date.now() - user.updatedAt > 1000 * 60 * 60) {
                user.update({warn: true}).then(() => {
                    client.fetchUser(user.userID).then((fetchedUser) => {
                        fetchedUser.createDM().then((dmChan) => {
                            dmChan.send(`${fetchedUser}, your spot in the interview waitlist will expire within thirty minutes. \n Call "!interview waitlist renew" to claim your spot for another hour.`);
                        });
                    })
                })
            }
        })
    });
    Waitlist.find({warn: true}).then((users) => {
        users.forEach((user) => {
            if (Date.now() - user.updatedAt > 1000 * 60 * 90) {
                user.remove().then(() => {
                    client.fetchUser(user.userID).then((fetchedUser) => {
                        fetchedUser.createDM().then((dmChan) => {
                            dmChan.send(`${fetchedUser}, we removed you from the interview waitlist.`);
                        });
                    })
                })
            }
        })
    })
}, 1000 * 60 * 5);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    handleResume(msg);
    handleRoles(msg);
    handleTimezone(msg);
    handleInspiration(msg);
    handleInterview(msg);
});

client.login(process.env.TOKEN_SECRET);
