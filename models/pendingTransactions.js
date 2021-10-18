const mongo = require("mongoose");

// const mongo = require(Mongoose)\
const pendingTx = mongo.Schema({
    hash:{
        type:String,
        unique:true
    }
});

module.exports = mongo.model('PendingTx', pendingTx);