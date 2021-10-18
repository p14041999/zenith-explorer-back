const mongo = require('mongoose');

const addressSchema = mongo.Schema({
    address:{
        type:String,
        unique:true
    },
    balance:{
        type:Number,
        default:0
    },
    transactions:[
        {
            type:mongo.Schema.Types.ObjectId,
            ref:'Transaction'
        }
    ],
    isContract:{
        type:Boolean,
        default:false,
    },
    isToken:{
        type:Boolean,
        default:false
    },
    tokenName:{
        type:String
    }
})
module.exports = mongo.model("Address",addressSchema);