const Discord = require("discord.js");
const dotenv  = require("dotenv");
const client  = new Discord.Client();

var queue = [];

dotenv.config();

/* Yes, I know this is a mess. I'm just trying to get it functional, then
 * we can be more discerning about the quality of this code and how to
 * destructure it properly.
 **/

function handleResume(msg) {
    function sendHelp(msg) {
        msg.reply('!resume is the resume queue for this server.\n' +
          'Use !resume submit [url to resume] to add a resume.\n' +
          'Use !resume get to get a resume to review.\n' +
          'Remember to mention the user so they see the comments you made!')
    }
    
    function verifyAdded(msg) {
        msg.reply(`successfully added you to the resume queue.`);
    }

    if (msg.channel.name === "resume-review") {
        if (msg.content.startsWith('!resume')) {
            const splitmsg = msg.content.split(" ");
            console.log(splitmsg);
            if ((splitmsg.length == 1) || (splitmsg[1] == 'help')) {
                sendHelp(msg);
            } else if ((splitmsg[1] == 'submit' || splitmsg[1] == 'add') && (splitmsg.length == 3)) {
                if (queue.filter((auth) => auth[0].id == msg.author.id).length != 0) {
                  msg.reply(`sorry, you already have a resume in the queue.`)
                } else {
                  queue.push([msg.author, splitmsg[2]]);
                  verifyAdded(msg);
                }
            } else if (splitmsg[1] == 'get') {
                if (queue.length == 0) {
                    msg.reply("there are no resumes currently in the queue.");
                } else {
                    const reply = queue.shift();
                    msg.reply(`resume by ${reply[0]}: ${reply[1]}`);
                }
            } else if (splitmsg[1] == 'show') {
                if (queue.length == 0) {
                    msg.reply("there are no resumes currently in the queue.");
                } else {
                    msg.reply("resume list :\n");
                    for(var i = 0; i < queue.length; i++){
                        msg.reply(`${queue[i][0]}: ${queue[i][1]}`);
                    }
                }
            } else {
              msg.reply("that's an invalid query. Try !resume help.");
            }
        }
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    handleResume(msg);
});

client.login(process.env.TOKEN_SECRET);
