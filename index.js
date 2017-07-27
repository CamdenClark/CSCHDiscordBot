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
        msg.reply('"!resume" is the resume queue for this server.\n' +
                  'Use "!resume submit <url to resume>" to add a resume.\n' +
                  'Use "!resume poll" to get a resume to review.\n' +
                  'Use "!resume show" to see the resumes currently in the queue.\n' +
                  'Remember to mention the user so they see the comments you made!')
    }

    function verifyAdded(msg) {
        msg.reply(`successfully added you to the resume queue.`);
    }

    if (msg.channel.name === "resume-review") {
        if (msg.content.toLowerCase().startsWith('!resume')) {
            const splitmsg = msg.content.split(" ");
            console.log(splitmsg);
            switch(splitmsg[1].toLowerCase()) {
                case 'help':
                    if(splitmsg.length == 1) {//length verification
                        sendHelp(msg);
                    }
                    break;
                case 'submit':
                case 'add':
                    if(splitmsg.length == 3) {//length verification
                        if (queue.filter((auth) => auth[0].id == msg.author.id).length != 0) {
                            msg.reply(`sorry, you already have a resume in the queue.`)
                        } else {
                            queue.push([msg.author, splitmsg[2]]);
                            verifyAdded(msg);
                        }
                    }
                    break;
                case 'poll':
                    if(splitmsg.length == 1) {//length verification
                        if (queue.length == 0) {
                            msg.reply("there are no resumes currently in the queue.");
                        } else {
                            const reply = queue.shift();
                            msg.reply(`resume by ${reply[0]}: ${reply[1]}`);
                        }
                    }
                    break;
                case 'show':
                    if(splitmsg.length == 1) {//length verification
                        if (queue.length == 0) {
                            msg.reply("there are no resumes currently in the queue.");
                        } else {
                            msg.reply("resumes currently in the queue:\n\n");
                            for(var i = 0; i < queue.length; i++){
                                msg.channel.send(`${queue[i][0]}: ${queue[i][1]}`);
                            }
                        }
                    }
                    break;
                default:
                    msg.reply("that's an invalid query. Try !resume help.");
                    break;
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
