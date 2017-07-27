const Discord = require("discord.js");
const dotenv  = require("dotenv");
const client  = new Discord.Client();

var queue = [];
var backlog = [];

dotenv.config();

/* Yes, I know this is a mess. I'm just trying to get it functional, then
 * we can be more discerning about the quality of this code and how to
 * destructure it properly.
 **/

function handleResume(msg) {

    function sendHelp(msg) {
        msg.reply('"!resume" is the resume queue for this server.\n' +
                  'Use "!resume submit <url to resume>" to add a resume.\n' +
                  'Use "!resume poll" to get a resume to review and delete it from the queue.\n' +
                  'Use "!resume show" to see the next 3 resumes currently in the queue.\n' +
                  'Use "!resume delete" to delete a resume you submitted.\n' +
                  'Remember to mention the user so they see the comments you made!')
    }

    /*I don't think you need to pass in msg,
        because the scope of it is the entire handleResume() function */
    function verifyAdded(msg) {
        msg.reply(`successfully added you to the resume queue.`);
    }


    /**
     * attempts to add an entry to the resume queue
     * Restriction: users may only have 1 resume in the queue at a time
     */
    function enqueue() {
        if (queue.filter((auth) => auth[0].id == msg.author.id).length != 0) {
            msg.reply(`sorry, you already have a resume in the queue.`)
        } else {
            queue.push([msg.author, splitmsg[2]]);
            verifyAdded(msg);
        }
    }

    /**
     * attempts to get and remove the first resume from the queue.
     */
    function poll() {
        if (queue.length == 0) {
            msg.reply("there are no resumes currently in the queue.");
        } else {
            const reply = queue.shift();
            msg.reply(`resume by ${reply[0]}: ${reply[1]}`);
        }
    }

    /**
     * hidden peek feature (returns but does not remove first element in the queue).
     * It's kinda bad for the people waiting, though
     * gets first resume in queue, but does not remove
     */
    function peek() {
        if (queue.length == 0) {
            msg.reply("there are no resumes currently in the queue.");
        } else {
            const reply = queue[0];
            msg.reply(`resume by ${reply[0]}: ${reply[1]}`);
        }
    }

    /**
     * shows how many resumes are in the queue
     */
    function show() {
        if (queue.length == 0) {
            msg.reply("there are no resumes currently in the queue.");
        } else {
            msg.reply("resumes currently in the queue:\n\n");
            for (var i = 0; i < queue.length; i++) {
                msg.channel.send(`${queue[i][0]}: ${queue[i][1]}`);
            }
        }
    }
  
   /**
    * deletes user's enqueued resume
    */
    function deleteResume() {
      if (queue.length === 0) {
        msg.reply("there are no resumes currently in the queue.");
      } else if (queue.filter((auth) => auth[0].id == msg.author.id).length == 0) {
        msg.reply("you don't have a resume in the queue.");
      } else {
        queue = queue.filter((auth) => auth[0].id != msg.author.id);
        msg.reply("successfully deleted your resume.");
      }
    }

    /**
     * shows message denoting invalid command
     */
    function showError() {
        msg.reply("that's an invalid query. Try !resume help.");
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
                case 'offer':
                    if(splitmsg.length == 3) {//length verification
                        enqueue();
                    } else {
                        showError();
                    }
                    break;
                case 'poll':
                    if(splitmsg.length == 1) {//length verification
                        poll();
                    } else {
                        showError();
                    }
                    break;
                case 'peek':
                    if(splitmsg.length == 1) {//length verification
                        peek();
                    } else {
                        showError();
                    }
                case 'show':
                    if(splitmsg.length == 1) {//length verification
                        show();
                    } else {
                        showError();
                    }
                    break;
                case 'delete':
                        if(splitmsg.length === 2) {//length verification
                            delete();
                        }
                        break;
                default:
                    showError();
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
