const { map, filter }  = require("lodash");


//database
/*
not sure what I'm doing either
 */
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/IVDB";

MongoClient.connect(url, function(error, db) {
    if(error) {
        throw error;
    }
    db.createCollection("interviewees");

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
        [admin] poll: gets and removes 1st in waitlist, and sends notification w/collabedit link, etc
*/

module.exports = function handleIVRequest(msg, prod) {
    const listenChan = prod ? "roles" : "bot-development";
    var splitmsg = msg.content.split(" ");


    //parses input
    if ((msg.channel.name === listenChan) && msg.content.toLowerCase().startsWith('!interview')) {

    }
}