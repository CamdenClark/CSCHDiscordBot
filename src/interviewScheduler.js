const {map, filter, values} = require("lodash");
const moment = require("moment");
const IVB = require("../models/interviewBlockModel");
const Waitlist = require("../models/interviewWaitlistModel");

//moment.format();
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
		  '========NOT YET OPERATIONAL========\n'+
		  'Use "!interview waitlist" to see size of waitlist.\n' +
            'Use "!interview waitlist poll" to get and remove the next user in the waitlist. [You must be an interviewer to do this.]\n' +
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

    function stringToRole(role) {
        const stringRoles = map(msg.guild.roles.array(), (i) => i.name);
        const index = stringRoles.indexOf(role);
        return msg.guild.roles.array()[index];
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
        client.fetchUser(msg.author.id).then((msgUser) => msg.guild.fetchMember(msgUser).then((guildUser) => {
            if (!guildUser.roles.array().includes(stringToRole('Interviewers'))) {
                msg.reply(`you must be an interviewer to do that.`);
            } else {
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
        }));
    }

    //interviewer only

    /**
     * Creates [repetitions] unbooked blocks with [msg.author.id] as host
     * of [interview_length] minutes starting at [start_time]
     */
    function createBlocks() {
        //TODO timezone. currently [hypothetical timezone] is used, and arg 4 (time_zone) is ignored
        function notifyBlocksCreated() {
            msg.reply("Created " + repetitions + " open blocks of " + interview_length + " minutes each\n" +
                "starting at " +startTimeStamp.toString());
        }

        /*
         * splimsg    0        1        2            3          4            5               6
         * input: !interview open [start date] [start time] [time_zone][interview_length] [repetitions]
         * splitmsg           0       1      2        3          4      5  6
         * example usage: !interview open 2017-08-04 15:30 HYPOTHETICAL 60 3       //blocks at 15:30, 16:30, and 17:30
         * preconditions:
         *     [repetitions] > 0
         *     [interview length] > 30min
         * [start date]: YYYY-MM-DD or keywords: "today", "tomorrow", "<some>day"
         *
         */

        //variables are more organized
        var start_date = splitmsg[2];
        var start_time = splitmsg[3];
        var time_zone = splitmsg[4];
        var interview_length = splitmsg[5];
        var repetitions = splitmsg[6];

        //keywords TODO tomorrow, <some>day
        if(start_date === "today") {
            start_date = moment().format("YYYYMMDD");
        }

        var startTimeStamp = moment(start_date[2] + " " + start_time);
        var mutating_endTimeStamp = startTimeStamp.clone();
        for(var rep = 1; rep <= repetitions; rep++) {
            mutating_endTimeStamp.add(interview_length,"minute");
            var block = new IVB({
                start_time: startTimeStamp,
                end_time: mutating_endTimeStamp.clone(),
                host_ID: msg.author.id,
                interviewee_ID: NaN //not yet booked
            });
            block.save().then(() => notifyBlocksCreated());
        }

    }



    //internal use only

    /**
     * testing only
     */
    function showAllBlocks() {
        //find all of em
        msg.reply(IVB.find({}));
    }


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
	console.log(splitmsg);
	if (splitmsg.length > 1) {
            switch (splitmsg[1].toLowerCase()) {
                case 'waitlist':
                    handleWaitListCmd();
                    break;

                //debug usage only
                case 'show_all_blocks':
                    showAllBlocks();
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
};
