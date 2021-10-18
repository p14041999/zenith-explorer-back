const mongo = require('mongoose');

const addressSchema = mongo.Schema({
    creationTx :String,
    address:{
        type:String,
        unique:true
    },
    bytecode:String,
    sourcecode:[
        {
            type:String
        }
    ],
    version:{type:String,default:'NA'},
    lang:{type:String,default:'NA'},
    creator:{
        type:String
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isToken:{
        type:Boolean,
        default:false
    },
    tokenName:{
        type:String
    },
    symbol:{
        type:String
    }
})

module.exports = mongo.model("Contract",addressSchema);
