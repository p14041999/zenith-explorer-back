const mongo = require('mongoose');

const minerSchema = new mongo.Schema({
    address:{
        type:String,
    },
    lastMinedBlock:{
        type:Number,
    },
    lastMinedAt:{
        type:Number
    }
});

module.exports = mongo.model('Miner',minerSchema);