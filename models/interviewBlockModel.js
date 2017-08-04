const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const IVBSchema = new Schema({
    start_time: {type: Date},
    end_time: {type: Date},
    interviewer: String,    //should not be NaN, as it is created with an interviewer, startTime, and endTime
    SUID: String,           //Semi-Unique ID for intweview block, unique per interviewer. This way, the interviewer can refer to each block uniquely
    interviewee: String     //NaN if unbooked
});

module.exports = mongoose.model('interviewBlocks', IVBSchema);