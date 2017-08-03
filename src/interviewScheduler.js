const {map, filter} = require("lodash");
const IVB = require("../models/interviewBlockModel.js");

//--------------------------------------UNDER CONSTRUCTION--------------------------------------//


//database

/*
not sure what I'm doing either
 */
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/IVDB";

MongoClient.connect(url, function (error, db) {
    if (error) {
        throw error;
    }
    db.createCollection("interviewees");
    db.createCollection("interviewBlocks");
});

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

module.exports = function handleIVRequest(msg, prod) {
    const listenChan = prod ? "roles" : "bot-development";
    var splitmsg = msg.content.split(" ");

    //output only
    function sendHelpIV() {
        msg.reply('' +
            'Use "!interview status" to check your status.\n' +
            'Use "!interview openings to show openings."\n' +
            'Use "!interview waitlist" to see size of waitlist.\n' +
            'Use "!interview waitlist join" to join waitlist.\n' +
            'Use "!interview waitlist leave" to leave waitlist.\n')
    }

    function showOpenings() {
        //TODO implement
    }

    function showStatus() {
        //TODO implement
    }

    //actions with output
    function joinWaitList() {
        //TODO implement
    }

    function leaveWaitlist() {
        //TODO implement
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
        //TODO implement
    }

    //parses input
    if ((msg.channel.name === listenChan) && (msg.content.toLowerCase().startsWith('!interview'))) {
        switch (splitmsg[0].toLowerCase()) {
            case 'waitlist':
                handleWaitListCmd();
                break;
            case 'openings': //!interview openings
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
                break;
            default:
                sendHelpIV();
                break;
        }
    }
}