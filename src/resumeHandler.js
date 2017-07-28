const { map, filter }  = require("lodash");

module.exports = function handleResume(msg, prod) {
    const listenChan = prod ? "resume-review" : "bot-development";

    const splitmsg = msg.content.split(" ");

    //output only
    function sendHelpResumes() {
        msg.reply('"!resume" is the resume queue for this server.\n' +
            'Use "!resume submit [url to resume]" to add a resume.\n' +
            'Use "!resume poll" to get a resume to review and delete it from the queue.\n' +
            'Use "!resume show" to see the next 3 resumes currently in the queue.\n' +
            'Use "!resume show [number]" to see up to that many' +
            'Use "!resume delete" to delete a resume you submitted.\n' +
            'Remember to mention the user so they see the comments you made!')
    }

    function verifyAdded() {
        msg.reply(`successfully added you to the resume queue.`);
    }

    /**
     * shows message denoting invalid command regarding resumes
     */
    function showErrorResume() {
        msg.reply("that's an invalid query. Try !resume help to see commands.");
    }

    /**
     * shows how many resumes are in the queue
     */
    function showNext(howMany) {
        howMany = parseInt(howMany);
        debugOut("howMany = " + howMany);
        if(isNaN(howMany)) {
            debugOut("that's not an integer");
            sendHelpResumes();
        }
        if (queue.length === 0) {
            msg.reply("there are no resumes currently in the queue.")
        } else {
            msg.author.createDM().then((dmChan) => {
                dmChan.send("resumes currently in the queue:\n\n");
                const showLength = queue.length < howMany ? queue.length : howMany;
                for (var i = 0; i < showLength; i++) {
                    dmChan.send(`${queue[i][0]}: <${queue[i][1]}>`);
                }
            })
        }
    }

    //actions with output
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
        if (queue.length === 0) {
            msg.reply("there are no resumes currently in the queue.");
        } else {
            const reply = queue.shift();
            msg.author.createDM().then((dmChan) => {
                dmChan.send(`resume by ${reply[0]}: ${reply[1]}`);
            });
        }
    }

    /**
     * deletes user's enqueued resume
     */
    function deleteResume() {
        if (queue.filter((auth) => auth[0].id == msg.author.id).length == 0) {
            msg.reply("you don't have a resume in the queue.");
        } else {
            queue = queue.filter((auth) => auth[0].id != msg.author.id);
            msg.reply("successfully deleted your resume.");
        }
    }

    //internal use only
    function debugOut(str) {
        if(!Boolean(prod)) {
            msg.reply('[Debug] '+str);
        }
    }

    //parses input
    if ((msg.channel.name === listenChan) && (msg.content.toLowerCase().startsWith('!resume'))) {
        if (splitmsg.length > 1) {
            console.log(splitmsg);
            switch(splitmsg[1].toLowerCase()) {
                case 'help':
                    if(splitmsg.length === 2) {
                        sendHelpResumes(msg);
                    }
                    break;
                case 'submit':
                case 'add':
                    if(splitmsg.length === 3) {
                        enqueue();
                    } else {
                        showErrorResume();
                    }
                    break;
                case 'poll':
                    if(splitmsg.length === 2) {
                        poll();
                    } else {
                        showErrorResume();
                    }
                    break;
                case 'peek': //hidden, but calls showNext(1)
                    if(splitmsg.length === 2) {
                        showNext(1);
                    } else {
                        showErrorResume();
                    }
                case 'show':
                    debugOut("case show");
                    if(splitmsg.length === 2) {
                            debugOut("len = 2, showing next 3 resumes");
                            showNext(3);
                    } else if(splitmsg.length === 3){
                        debugOut("len = 3, showing next [number] resumes");
                            showNext(splitmsg[2]);
                            debugOut("next [number] resumes shown");
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
};
