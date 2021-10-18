const mongo = require('mongoose');

const addressSchema = mongo.Schema({
    address:{
        type:String,
        unique:true
    },
    tokenName:{
        type:String
    },
    symbol:{
        type:String
    },
    totalSupply:{
        type:String
    },
    transactions:[
        {
            from:String,
            to:String,
            value:String,
        }
    ]
})

module.exports = mongo.model("Token",addressSchema);
