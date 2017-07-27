const Discord = require("discord.js");
const dotenv  = require("dotenv");
const client  = new Discord.Client();

const { map, filter }  = require("lodash");

var queue = [];

dotenv.config();

/* Yes, I know this is a mess. I'm just trying to get it functional, then
 * we can be more discerning about the quality of this code and how to
 * destructure it properly.
 **/

function handleRoles(msg) {
    programmingRoles = ['C++', 'C', 'C#', 'Go', 'Haskell', 'Java', 'Javascript',
                        'Objective-C', 'PHP', 'Python', 'Ruby', 'Scala', 'SQL', 'Swift']

    seniorityRoles   = ['Student', 'Intern', 'Junior Developer', 'Mid-level Developer', 'Senior Developer']

    var splitmsg = msg.content.split(" ");

    function sendHelpRoles() {
        msg.reply(`
    Use "!role add [role]" to add a role.
    Use "!role remove [role]" to delete a role.
    Must be exactly as displayed.

    Don't abuse the programming language tags, please, be reasonable!
    Programming Language Roles:
        ${programmingRoles.join('\n        ')}
        
    You are only allowed one seniority role. Select the role that best reflects where you're at in your career.
    Seniority Roles:
        ${seniorityRoles.join('\n        ')}
        `);
    }

    function verifyAddedRole() {
        msg.reply(`added ${splitmsg[2]} to your roles.`);
    }

    function notValidRole() {
        msg.reply(`${splitmsg[2]} is not a valid role.`);
    }

    function duplicateRole() {
        msg.reply(`${splitmsg[2]} is already in your role list.`);
    }

    function duplicateSeniorityRole() {
        msg.reply(`you already have a seniority role.`);
    }

    function stringToRole(role) {
        const stringRoles = map(msg.guild.roles.array(), (i) => i.name);
        const index = stringRoles.indexOf(role);
        return msg.guild.roles.array()[index];
    }

    function removeRole(role) {
        msg.guild.fetchMember(msg.author).then((user) => {
            if (user.roles.array().includes(stringToRole(role)) && (programmingRoles.includes(role) || seniorityRoles.includes(role))) {
                user.removeRole(stringToRole(role)).then(() => {
                    msg.reply(`successfully removed role ${role}.`);
                }).catch(() => {
                    msg.reply(`failed to remove role ${role}.`);
                })
            } else if (!user.roles.array().includes(stringToRole(role))) {
                msg.reply(`you don't have that role.`);
            }
        });
    }

    function clearRoles() {
        msg.guild.fetchMember(msg.author).then((user) => {
            user.roles.array().length = 0;
            msg.reply('successfully cleared all your roles');
        });
    }

    function noDupeSeniorityRoles(user) {
        return filter(seniorityRoles, (roleName) => user.roles.array().includes(stringToRole(roleName))).length === 0;
    }

    function addRole(role) {
        msg.guild.fetchMember(msg.author).then((user) => {
            if (user.roles.array().includes(stringToRole(role))) {
                duplicateRole();
            } else if (programmingRoles.includes(role)) {
                user.addRole(stringToRole(role)).then(() => {
                    verifyAddedRole();
                }).catch(() => {
                    msg.reply(`failed to add role ${role}.`);
                })
            } else if (seniorityRoles.includes(role)) {
                if (noDupeSeniorityRoles(user)) {
                    user.addRole(stringToRole(role)).then(() => {
                        verifyAddedRole();
                    }).catch(() => {
                        msg.reply(`failed to add role ${role}.`);
                    })
                } else {
                    msg.reply('you already have a seniority role.');
                }
            } else {
                notValidRole();
            }
        })
    }

    if ((msg.channel.name === "roles" ||  msg.channel.name === "bot-development") && msg.content.toLowerCase().startsWith('!role')) {
        if (splitmsg.length > 2) {
            splitmsg[2] = splitmsg.slice(2).join(" ")
            switch(splitmsg[1]) {
                case 'add':
                    addRole(splitmsg[2]);
                    break;
                case 'remove':
                    removeRole(splitmsg[2]);
                    break;
                case 'clear':
                    clearRoles();
                default:
                    sendHelpRoles();
                    break;
            }
        } else {
            sendHelpRoles();
        }
    }
}

function handleResume(msg) {

    const splitmsg = msg.content.split(" ");

    function sendHelp() {
        msg.reply('"!resume" is the resume queue for this server.\n' +
                  'Use "!resume submit <url to resume>" to add a resume.\n' +
                  'Use "!resume poll" to get a resume to review and delete it from the queue.\n' +
                  'Use "!resume show" to see the next 3 resumes currently in the queue.\n' +
                  'Use "!resume delete" to delete a resume you submitted.\n' +
                  'Remember to mention the user so they see the comments you made!')
    }

    function verifyAdded() {
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
            msg.reply("there are no resumes currently in the queue.")   
        } else {
            msg.author.createDM().then((dmChan) => {
                dmChan.send("resumes currently in the queue:\n\n")
                const showLength = queue.length < 3 ? queue.length : 3
                for (var i = 0; i < showLength; i++) {
                    dmChan.send(`${queue[i][0]}: ${queue[i][1]}`);
                }
            }) 
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
     * shows message denoting invalid command regarding resumes
     */
    function showErrorResume() {
        msg.reply("that's an invalid query. Try !resume help to see commands.");
    }

    if ((msg.channel.name === "resume-review" ||  msg.channel.name === "bot-development") && msg.content.toLowerCase().startsWith('!resume')) {
        if (splitmsg.length > 1) {
            console.log(splitmsg);
            switch(splitmsg[1].toLowerCase()) {
                case 'help':
                    if(splitmsg.length == 2) {
                        sendHelp(msg);
                    }
                    break;
                case 'submit':
                case 'add':
                    if(splitmsg.length == 3) {
                        enqueue();
                    } else {
                        showErrorResume();
                    }
                    break;
                case 'poll':
                    if(splitmsg.length == 2) {
                        poll();
                    } else {
                        showErrorResume();
                    }
                    break;
                //case 'peek':
                //    if(splitmsg.length == 1) {
                //        peek();
                //    } else {
                //        showErrorResume();
                //    }
                case 'show':
                    if(splitmsg.length == 2) {
                        show();
                    } else {
                        showErrorResume();
                    }
                    break;
                case 'delete':
                    if(splitmsg.length === 2) {
                        deleteResume();
                    }
                    break;
                default:
                    showErrorResume();
                    break;
            }
        } else {
            showErrorResume();
        }          
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    handleResume(msg);
    handleRoles(msg);
});

client.login(process.env.TOKEN_SECRET);
