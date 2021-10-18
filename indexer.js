const Web3 = require('web3');
const Transaction = require('./models/transaction');
const Block = require('./models/block');
const Address = require('./models/address');
const Token = require('./models/token');
const Contract = require('./models/contract');
const Miner = require('./models/miner');
// const { Error } = require('mongoose');
const {abi} = require('./abi/ERC20.json');
class Indexer{
    
    constructor(ws_link="wss://mainnet.infura.io/ws/v3/8b43293541c64572bb5c51fb29870855",rpc_link="https://mainnet.infura.io/v3/8b43293541c64572bb5c51fb29870855"){
        this.ws_link = ws_link;
        this.web3 = new Web3(rpc_link);
        this.rpc_link = rpc_link;
    }
    subscribe(){
        let web3 = new Web3(this.ws_link);
        return web3.eth.subscribe("newBlockHeaders");
    }
    addToDB(){

    }
    getBlock(hash){
        this.web3.eth.getBlock(hash,true).then(async (e)=>{
            try{
            if(e.transactions.length >= 1){
                let block = new Block(e);
                block.transactions = [];
                e.transactions.forEach(async (tx)=>{
                    try{
                        block.transactions.push({hash:tx.hash});
                        await this.saveTxnToDB(tx,e.timestamp);
                    }catch(e){
                        console.log(e)
                    }
                    // return;
                })
                await block.save();
                let miner = await Miner.findOne({address:block.miner});
                if(miner){
                    miner.lastMinedBlock = block.number;
                    miner.lastMinedAt = block.timestamp;
                    await miner.save();
                }else{
                    let miner = new Miner({
                        address:block.miner,
                        lastMinedBlock:block.number,
                        lastMinedAt:block.timestamp
                    })
                    await miner.save();
                }
            }
            }catch(e){
                console.log(e);
            }
        });
    }
    async saveTxnToDB(tx,timestamp){
        let receipt = await this.web3.eth.getTransactionReceipt(tx.hash);
        // console.log(iscontract);
        if(receipt.contractAddress != null){
            // Contract Creation Transaction
            /// Create Transaction
            let txn = await this.createTransaction(tx,receipt,timestamp,true,false);
            /// check for token
            if(await this.isToken(receipt.contractAddress)){
                /// Get token info
                let {name,symbol,totalSupply} = await this.getTokenInfo(receipt.contractAddress);

                /// Create token
                await this.createContract(tx,receipt,timestamp,true,name,symbol);

                /// create Contract
                let token = new Token({
                    address:receipt.contractAddress,tokenName:name,symbol,totalSupply
                })
                await token.save();
                // Read logs for Token Transfer
            }else{
                /// create Contract
                await this.createContract(tx,receipt,timestamp,false);
            }
            /// Add to transaction list of addresses
            let fromAddr = await Address.findOne({address:txn.from});
            if(fromAddr != {} && fromAddr != null){
                fromAddr.transactions.push(txn);
                await fromAddr.save();
            }else{
                // console.log(fromAddr);
                fromAddr = new Address({
                    address:txn.from,
                    transactions:[txn],
                    isContract:false
                });
                await fromAddr.save();
            }
            let toAddr = await Address.findOne({address:txn.contractAddress});
            if(toAddr != {} && toAddr != null){
                toAddr.transactions.push(txn);
                await toAddr.save();
            }else{
                toAddr = new Address({
                    address:txn.contractAddress,
                    transactions:[txn],
                    isContract:true
                });
                await toAddr.save();
            }
        }else{
            // Something Else
            let iscontract = await this.isContract(tx.to);
            if(iscontract){
                // Contract Interaction
                let txn = await this.createTransaction(tx,receipt,timestamp);
                /// Add to transaction list of addresses
                let fromAddr = await Address.findOne({address:txn.from});
                if(fromAddr != {} && fromAddr != null){
                    fromAddr.transactions.push(txn);
                    await fromAddr.save();
                }else{
                    // console.log(fromAddr);
                    fromAddr = new Address({
                        address:txn.from,
                        transactions:[txn],
                        isContract:false
                    });
                    await fromAddr.save();
                }
                let toAddr = await Address.findOne({address:txn.to});
                if(toAddr != {} && toAddr != null){
                    toAddr.transactions.push(txn);
                    await toAddr.save();
                }else{
                    // console.log(toAddr);
                    toAddr = new Address({
                        address:txn.to,
                        transactions:[txn],
                        isContract:true
                    });
                    await toAddr.save();
                }
            }else{
                // Normal Transaction
                let txn = await this.createTransaction(tx,receipt,timestamp,false,false);
                /// Add to transaction list of addresses
                let fromAddr = await Address.findOne({address:txn.from});
                if(fromAddr != {} && fromAddr != null){
                    fromAddr.transactions.push(txn);
                    await fromAddr.save();
                }else{
                    fromAddr = new Address({
                        address:txn.from,
                        transactions:[txn],
                        isContract:false
                    });
                    await fromAddr.save();
                }
                let toAddr = await Address.findOne({address:txn.to});
                if(toAddr != {} && toAddr != null){
                    toAddr.transactions.push(txn);
                    await toAddr.save();
                }else{
                    toAddr = new Address({
                        address:txn.to,
                        transactions:[txn],
                        isContract:false
                    });
                    await toAddr.save();
                }
            }
        }
    }
    async isToken(address){
        try{   
            let contract = new this.web3.eth.Contract(abi,address);
            await contract.methods.totalSupply().call();
            return true;
        }catch(e){
            return false;
        }
    }
    async getTokenInfo(address){
        try{   
            let contract = new this.web3.eth.Contract(abi,address);
            let name = await contract.methods.name().call();
            let symbol = await contract.methods.symbol().call();
            let totalSupply = await contract.methods.totalSupply().call();
            return {name, symbol, totalSupply};
        }catch(e){
            console.log(e);
            throw Error("Error!");
        }
    }
    async isContract(addr){
        let code = await this.web3.eth.getCode(addr);
        if(code.length == '0x'){
            return false;
        }else{
            return true;
        }
    }

    start(){
        let subscription = this.subscribe()
        .on("connected", function(subscriptionId){
            console.log("ID:",subscriptionId);
        })
        .on("data", (blockHeader)=>{
            console.log("New Block");
            this.getBlock(blockHeader.hash);
        })
        .on("error", console.error);
    }
    async createTransaction(tx,receipt,timestamp,creation=false,Interaction=true){
        try {
            let txn = new Transaction({
                status:receipt.status,
                blockHash:receipt.blockHash,
                blockNumber:receipt.blockNumber,
                hash : tx.hash,
                transactionIndex: receipt.transactionIndex,
                from : receipt.from,
                to : receipt.to,
                contractAddress : receipt.contractAddress,
                cumulativeGasUsed : receipt.cumulativeGasUsed,
                gasUsed : receipt.gasUsed,
                logs :receipt.logs,
                gas: tx.gas,
                gasPrice: tx.gasUsed,
                input: tx.input,
                maxFeePerGas: tx.maxFeePerGas,
                maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
                nonce: tx.nonce,
                type: tx.type,
                v: tx.v,
                r: tx.r,
                s: tx.s,
                value: tx.value,
                isContractCreation:creation,
                isContractInteraction: Interaction,
                timestamp
            })
            await txn.save();
            return txn;
        } catch (error) {
            throw new Error(error);
        }
    }
    async createContract(tx,receipt,timestamp,isToken,tokenName="NA",symbol="NA"){
        try {
            let contract = new Contract({
                creationTx :tx.hash,
                address:receipt.contractAddress,
                bytecode:tx.input,
                creator:tx.from,
                isToken,
                tokenName,
                symbol,
                timestamp
            })
            await contract.save();
            return contract;
        } catch (error) {
            throw new Error(error);
        }
    }
    
}

module.exports = Indexer;