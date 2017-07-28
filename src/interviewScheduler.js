const { map, filter }  = require("lodash");

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


module.exports = function handleIVRequest(msg, prod) {

}