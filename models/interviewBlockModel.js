const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const IVBSchema = new Schema({
    start_time: {type: Date},
    end_time: {type: Date},
    interviewer: String,   //should not be NaN, as it is created with an interviewer, startTime, and endTime
    interviewee: String    //NaN if unbooked
});

module.exports = mongoose.model('interviewBlocks', IVBSchema);