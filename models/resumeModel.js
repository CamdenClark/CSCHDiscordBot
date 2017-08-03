const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const resumeSchema = new Schema({
    userID: String,
    resume: String,
    timeStamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('resumes', resumeSchema);