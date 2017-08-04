const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const IVWSchema = new Schema({
    userID: String,    //NaN if unbooked
    warn: false
}, { timestamps: true });

module.exports = mongoose.model('interviewWaitlist', IVWSchema);