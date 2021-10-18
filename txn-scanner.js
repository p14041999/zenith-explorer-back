const Web3 = require('web3');
const PendingTx = require('./models/pendingTransactions');
class TxnScanner{
    ws_link;
    web3;
    constructor(ws_link="wss://mainnet.infura.io/ws/v3/9aa3d95b3bc440fa88ea12eaa4456161",rpc_link="https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"){
        this.ws_link = ws_link;
        this.web3 = new Web3(rpc_link);
    }
    subscribe(){
        let web3 = new Web3(this.ws_link);
        return web3.eth.subscribe("pendingTransactions");
    }

    start(){
        let subscription = this.subscribe()
        .on("connected", function(subscriptionId){
            console.log("ID:",subscriptionId);
        })
        .on("data", async (hash)=>{
            // console.log(hash);
            try{
                await this.saveToDB(hash);
                console.log("done");
            }catch(e){
                console.log(e);
            }
        })
        .on("error", console.error);
    }

    async saveToDB(hash){
        let pendingTx = new PendingTx({hash});
        await pendingTx.save();
    }
}

module.exports = TxnScanner;