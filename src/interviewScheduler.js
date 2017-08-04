const {map, filter} = require("lodash");
const IVB = require("../models/interviewBlockModel");
const Waitlist = require("../models/interviewWaitlistModel");

//--------------------------------------UNDER CONSTRUCTION--------------------------------------//

/*
spec:
    !interview openings: shows empty timeslots
    !interview status: shows user's status:
        if IV scheduled, timeslot
        elif waitlisted, spot in queue
        else "nothing scheduled"
    !interview waitlist:
        <nothing>: size of queue
        join: add user to end of waitlist
        leave: leave waitlist
    [admin, maybe hidden]!interview poll:
        if next timeslot filled:
            get that user
        else
            poll waitlist queue for next user
        notifies user, sends collabedit link, etc
*/

module.exports = function handleIVRequest(msg) {
    const listenChan = productionEnv ? "mock-interviews" : "bot-development";
    var splitmsg = msg.content.split(" ");

    //output only
    function sendHelpIV() {
        msg.reply('\n' +
    /*        'Use "!interview status" to check your status.\n' +
            'Use "!interview openings to show openings."\n' + */
            'Use "!interview waitlist" to see size of waitlist.\n' +
            'Use "!interview waitlist poll" to get the next user in the waitlist.\n' +
            'Use "!interview waitlist join" to join waitlist.\n' +
            'Use "!interview waitlist leave" to leave waitlist.\n' +
            'Use "!interview waitlist renew" to renew your spot in the waitlist.\n' +
            'Waitlist spots expire after 90 minutes, you will need to renew to stay in the waitlist.\n'
        );
    }

    function showOpenings() {
        //TODO implement
    }

    function showStatus() {
        //TODO implement
    }

    function showWaitlistCount() {
        Waitlist.count()
            .then((count) => msg.reply(`there are ${count} people in the interview waitlist.`))
            .catch((err) => {
                console.log(err);
                msg.reply(`there was an error showing the waitlist count.`);
            });
    }

    //actions with output
    function joinWaitlist() {
        Waitlist.find({userID: msg.author.id}).then((waiters) => {
            if (waiters.length > 0) {
                msg.reply(`you're already in the waitlist queue. Try again later.`);
            } else {
                const newWaiter = new Waitlist({userID: msg.author.id, warn: false});
                newWaiter.save()
                    .then(() => msg.reply(`succesfully added you to the interview waitlist.`))
                    .catch((err) => {
                        console.log(err);
                        msg.reply(`there was an error adding you to the waitlist.`);
                    });
            }
        });
    }

    function leaveWaitlist() {
        Waitlist.find({userID: msg.author.id})
            .then((users) => {
                if (users.length === 0) {
                    msg.reply(`you aren't in the waitlist queue.`);
                } else {
                    users[0].remove().then(() => msg.reply(`successfully removed you from the waitlist.`));
                }
            })
            .catch((err) => {
                console.log(err);
                msg.reply(`there was an error removing you from the waitlist.`);
            });
    }

    function renewWaitlist() {
        Waitlist.findOne({userID: msg.author.id})
            .then((user) => {
                if (Date.now() - user.updatedAt < 1000 * 60 * 40) {
                    msg.reply(`it's too early to renew your waitlist spot.`)
                    msg.reply(`try again in ${Math.floor(40 - ((Date.now() - user.updatedAt) / (60 * 1000)))} minutes.`)
                } else {
                    user.update({warn: false}).then(() =>
                        msg.reply(`successfully renewed your spot in the waitlist.`));
                } 
            })
            .catch((err) => {
                console.log(err);
                msg.reply(`there was an error renewing you in the waitlist.`);
            });
    }

    function pollWaitlist() {
        Waitlist.find().sort({createdAt: 1}).then((users) => {
            users[0].remove().then(() => {
                client.fetchUser(users[0].userID).then((user) => {
                    msg.reply(`${user} is next in the queue.`);
                });
            })
            .catch((err) => {
                console.log(err);
                msg.reply(`there was an error polling the waitlist.`);
            });
        }).catch((err) =>
            msg.reply(`there's noone in the waitlist.`));
    }

    //interviewer only
    function createBlocks() {
        /*
         * input: !interview open [start date] [start time] [interview length] [repetitions]
         * [interview length] > 30min
         * [start date]: YYYY/MM/DD or keywords: "today", "tomorrow", "<some>day"
         * example usage: !interview open today 5:30PDT 60 3 //blocks at 5:30, 6:30, and 7:30
         */
    }

    //internal use only
    function handleWaitListCmd() {
        if (splitmsg.length === 2) {
            showWaitlistCount();
        } else if (splitmsg.length === 3) {
            switch (splitmsg[2].toLowerCase()) {
                case 'join':
                    joinWaitlist();
                    break;
                case 'leave':
                    leaveWaitlist();
                    break;
                case 'renew':
                    renewWaitlist();
                    break;
                case 'poll':
                    pollWaitlist();
                    break;
                default:
                    sendHelpIV();
                    break;
            }
        } else {
            sendHelpIV();
        }
    }

    //parses input
    if ((msg.channel.name === listenChan) && (msg.content.toLowerCase().startsWith('!interview'))) {
        if (splitmsg.length > 1) {
            switch (splitmsg[1].toLowerCase()) {
                case 'waitlist':
                    handleWaitListCmd();
                    break;
                /* case 'openings': //!interview openings
                    if (splitmsg.length == 2) {
                        showOpenings()
                    } else {
                        sendHelpIV();
                    }
                    break;
                case 'status': //!interview status
                    if (splitmsg.length == 2) {
                        showStatus();
                    } else {
                        sendHelpIV();
                    }
                    break; */
                default:
                    sendHelpIV();
                    break;
            }
        } else {
            sendHelpIV();
        }
    }
}