const r = {
    status:Boolean,
    blockHash:String,
    blockNumber:Number,
    hash : String,
    transactionIndex: Number,
    from : String,
    to : String,
    contractAddress : String,
    cumulativeGasUsed : Number,
    gasUsed : Number,
    logs :Array,
    gas: Number,
    gasPrice: String,
    input: String,
    maxFeePerGas: String,
    maxPriorityFeePerGas: String,
    nonce: Number,
    type: Number,
    v: String,
    r: String,
    s: String,
    value: String,
    isContractCreation:{
        type:Boolean,
        default:false
    },
    isContractInteraction:{
        type:Boolean,
        default:false
    },
    timestamp:Number
}

const mongo = require("mongoose");

module.exports = mongo.model("Transaction",mongo.Schema(r));