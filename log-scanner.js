const Web3 = require('web3');
const TokenTransaction = require('./models/tokenTransaction');
const LogAbi = [
    {
      "indexed": true,
      "name": "from",
      "type": "address"
    },
    {
      "indexed": true,
      "name": "to",
      "type": "address"
    },
    {
      "indexed": false,
      "name": "value",
      "type": "uint256"
    }
  ]

const LogAbi2 = [
{
    "indexed": true,
    "name": "from",
    "type": "address"
},
{
    "indexed": true,
    "name": "to",
    "type": "address"
},
{
    "indexed": true,
    "name": "value",
    "type": "uint256"
}
]


class LogScanner{
    ws_link;
    web3;
    constructor(ws_link="wss://mainnet.infura.io/ws/v3/8b43293541c64572bb5c51fb29870855",rpc_link="https://mainnet.infura.io/v3/8b43293541c64572bb5c51fb29870855"){
        this.ws_link = ws_link;
        this.web3 = new Web3(rpc_link);
    }
    subscribe(){
        let web3 = new Web3(this.ws_link);
        return web3.eth.subscribe("logs");
    }
    async showTransfersOnly(log){
        let topic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        if(log.topics[0] == topic){
            try{

                let Txn = this.web3.eth.abi.decodeLog(LogAbi,log.data,[log.topics[1],log.topics[2]]);
                let tokenTransaction = new TokenTransaction({
                    address:log.address,
                    from:Txn.from,
                    to:Txn.to,
                    value:Txn.value,
                    transactionHash:log.transactionHash
                })
                await tokenTransaction.save();
            }catch(e){
                try{
                    let Txn = this.web3.eth.abi.decodeLog(LogAbi2,log.data,[log.topics[1],log.topics[2],log.topics[3]]);
                    let tokenTransaction = new TokenTransaction({
                        address:log.address,
                        from:Txn.from,
                        to:Txn.to,
                        value:Txn.value,
                        transactionHash:log.transactionHash
                    })
                    await tokenTransaction.save();
                }catch(err){
                    console.log(err);
                }
            }
        }
    }
    start(){
        let subscription = this.subscribe()
        .on("connected", function(subscriptionId){
            console.log("ID:",subscriptionId);
        })
        .on("data", async (log)=>{
            await this.showTransfersOnly(log);
        })
        .on("error", console.error);
    }
}

module.exports = LogScanner;