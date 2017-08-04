const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const inspirationSchema = new Schema({
    story: String,
    timeStamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model('inspiration', inspirationSchema);