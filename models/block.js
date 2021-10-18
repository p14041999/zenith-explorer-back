const mongo = require('mongoose');
const blockSchema = mongo.Schema({
    baseFeePerGas: String,
    difficulty: String,
    gasLimit: Number,
    gasUsed: Number,
    hash: {
        type:String,
        unique:true
    },
    miner: String,
    nonce: String,
    number: Number,
    parentHash: String,
    size: Number,
    timestamp: Number,
    totalDifficulty: String,
    transactions: [
      {
        // blockHash: String,
        // blockNumber: Number,
        // from: String,
        // gas: Number,
        // gasPrice: String,
        hash: String,
        // input: String,
        // nonce: Number,
        // r: String,
        // s: String,
        // to: String,
        // transactionIndex: Number,
        // type: Number,
        // v: String,
        // value: String
      }
    ],
    transactionsRoot: String
})

module.exports = mongo.model('Block', blockSchema);