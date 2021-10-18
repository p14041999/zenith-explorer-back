const mongo = require("mongoose");

// const mongo = require(Mongoose)\
const pendingTx = mongo.Schema({
    address:{
        type:String
    },
    from:{
        type:String
    },
    to:{
        type:String
    },
    value:{
        type:String
    },
    transactionHash:{
        type:String
    }
});

module.exports = mongo.model('TokenTxn', pendingTx);