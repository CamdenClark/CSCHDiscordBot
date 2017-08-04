const {map, filter} = require("lodash");
const Resume = require("../models/resumeModel");

module.exports = function handleResume(msg) {
    const listenChan = productionEnv ? process.env.RESUME_PROD_CHAN : process.env.DEV_CHAN;

    const splitmsg = msg.content.split(" ");

    //output only
    function sendHelpResumes() {
        msg.reply('PSA: please anonymize your resumes.\n' +
            'Use "!resume submit [url to resume]" to add a resume.\n' +
            'Use "!resume delete" to delete a resume you submitted.\n' +
            'Use "!resume replace [new url] to replace your resume, and keep your spot.\n' +
            '\n' +
            'Use "!resume poll" to get a resume to review and delete it from the queue.\n' +
            'Use "!resume show" to see the next 3 resumes currently in the queue.\n' +
            'Use "!resume show all" to see all of them.\n' +
            'Use "!resume show [number]" to see up to that many.\n' +
            'Remember to mention the user so they see the comments you made!\n' +
            'PSA: please anonymize your resumes.')
    }

    function notifyNoResumeInQueue() {
        msg.reply("you don't have a resume in the queue.");
    }

    function notifyAlreadyInQueue() {
        msg.reply("you already have a resume in the queue. Try !resume replace [resume].")
    }

    function notifyAdded() {
        msg.reply('successfully added you to the resume queue.\n' +
            'PSA: please anonymize your resumes. You can replace your resume and keep your spot with !resume replace');
    }

    /**
     * shows message denoting invalid command regarding resumes
     */
    function showErrorResume() {
        msg.reply("that's an invalid query. Try !resume help to see commands. PSA: please anonymize your resumes.");
    }

    function notifyResumeQueueEmpty() {
        msg.reply("there are no resumes currently in the queue.")
    }

    //internal use only
    function idToUser(userID) {
        return client.fetchUser(userID);
    }

    /**
     * shows how many resumes are in the queue
     */
    function showNext(howMany) {
        const howManyInt = parseInt(howMany);
        if (isNaN(howManyInt)) {
            debugOut("that's not an integer");
            sendHelpResumes();
            return;
        } else if (howManyInt === 0) {
            msg.reply("you really want zero resumes? Try again, kiddo.");
            return;
        }
        debugOut("howMany = " + howManyInt);
        Resume.find().limit(howMany).sort({ timestamp: -1 }).then((queue) => {
            if (queue.length === 0) {
                notifyResumeQueueEmpty();
            } else {
                msg.author.createDM().then((dmChan) => {
                    dmChan.send("resumes currently in the queue:\n\n");
                    const users = map(queue, (resumeObj) => idToUser(resumeObj.userID));
                    const finalLen = howManyInt > queue.length ? queue.length : howManyInt;
                    Promise.all(users).then(resolveUsers => {
                        for (var i = 0; i < finalLen; i++) {
                            dmChan.send(`${resolveUsers[i]}: <${queue[i].resume}>`);
                        }
                    });
                });
            }
        })
    }

    //actions with output
    /**
     * attempts to add an entry to the resume queue
     * Restriction: users may only have 1 resume in the queue at a time
     */
    function enqueue() {
        Resume.find({userID: msg.author.id}).then((userResumes) => {
            if (userResumes.length !== 0) {
                notifyAlreadyInQueue();
            } else {
                const resumeToAdd = new Resume({userID: msg.author.id, resume: splitmsg[2]});
                resumeToAdd.save().then(() => notifyAdded(msg));
            }
        });
    }

    /**
     * attempts to get and remove the first resume from the queue.
     */
    function poll() {
        Resume.find().sort( { timestamp: -1 } ).limit(1).then((queue) => {
            if (queue.length === 0) {
                notifyResumeQueueEmpty();
            } else {
                queue[0].remove().then(() => {
                    client.fetchUser(queue[0].userID).then((user) => {
                        msg.reply(`resume by ${user}: <${queue[0].resume}>`);
                    });
                });          
            }
        });
    }

    /**
     * deletes user's enqueued resume
     */
    function deleteResume() {
        Resume.find({userID: msg.author.id}).then((userResumes) => {
            if (userResumes.length === 0) {
                notifyNoResumeInQueue();
            } else {
                userResumes[0].remove();
                msg.reply('successfully deleted your resume.');
            }
        });
    }

    function replaceResume() {
        Resume.findOne({userID: msg.author.id}).then((userResume) => {
            if (!userResume) {
                notifyNoResumeInQueue();
            } else {
                userResume.update({resume: splitmsg[2]}).then(msg.reply('successfully replaced your resume.'));
            }
        });
    }

    //internal use only
    function debugOut(str) {
        if (!Boolean(productionEnv)) {
            msg.reply('[Debug] ' + str);
        }
    }

    //parses input
    if ((msg.channel.name === listenChan) && (msg.content.toLowerCase().startsWith('!resume'))) {
        if (splitmsg.length > 1) {
            console.log(splitmsg);
            switch (splitmsg[1].toLowerCase()) {
                case 'help':
                    if (splitmsg.length === 2) {
                        sendHelpResumes(msg);
                    }
                    break;
                case 'submit':
                case 'add':
                    if (splitmsg.length === 3) {
                        enqueue();
                    } else {
                        showErrorResume();
                    }
                    break;
                case 'delete':
                case 'remove':
                    if (splitmsg.length === 2) {
                        deleteResume();
                    } else {
                        showErrorResume();
                    }
                    break;
                case 'replace':
                    if (splitmsg.length === 3) {
                        replaceResume();
                    } else {
                        showErrorResume();
                    }
                    break;
                case 'poll':
                    if (splitmsg.length === 2) {
                        poll();
                    } else {
                        showErrorResume();
                    }
                    break;
                case 'peek': //hidden, but calls showNext(1)
                    if (splitmsg.length === 2) {
                        showNext(1);
                    } else {
                        showErrorResume();
                    }
                    break;
                case 'show':
                    debugOut("case show");
                    if (splitmsg.length === 2) {
                        debugOut("len = 2, showing next 3 resumes");
                        showNext(3);
                    } else if (splitmsg.length === 3) {
                        if (splitmsg[2] === "all") {
                            showNext(999);
                            break;
                        }
                        debugOut("len = 3, showing next [number] resumes");
                        showNext(splitmsg[2]);
                        debugOut("next [number] resumes shown");
                    } else {
                        showErrorResume();
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
