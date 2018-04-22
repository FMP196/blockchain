// App.js

var require = require || false;

if (require) {
    // for node.js
    var crypto = require('crypto');
}

class Transaction {

    constructor(sender, receiver, amount){
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
    }
}

class Block {

    constructor ( timestamp, transactions, previousHash = '' ) {
        this.nonce = 0;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash () {

        if (require) {
            return crypto.createHash('sha512').update(this.toString()).digest('base64');
        } else {
            return CryptoJS.SHA512(this.toString()).toString();
        }
    }

    mineBlock ( difficulty ) {
        while (( this.hash.substring( 0, difficulty )) !== Array ( difficulty + 1 ).join( "0" )) {
            this.nonce++; 
            this.hash = this.calculateHash();
        }
        console.log("block mined: " + this.hash);
    }

    toString() {
        return ( this.nonce + this.timestamp + this.previousHash + JSON.stringify( this.transactions ));
    }
}


class Blockchain {

    constructor ( difficulty = 2 ) {
        this.difficulty = difficulty;
        this.chain = [ this.createGenesisBlock() ];
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block( Date.parse("1970-01-01"), [], "0" );
    }

    createTransaction ( transaction ) {
        this.pendingTransactions.push( transaction );
    }

    minePendingTransactions ( miningRewardAddress ) {
        let block = new Block( Date.now(), this.pendingTransactions, this.getLatestBlock().hash );
        block.mineBlock( this.difficulty );
        this.chain.push( block );
        this.pendingTransactions = [
        new Transaction( null, miningRewardAddress, this.miningReward )
        ];
    }

    getBalanceOfAddress ( address ) {
        let balance = 0;

        for ( const block of this.chain ) {
            for ( const trans of block.transactions ) {
                if ( trans.sender === address ) {
                    balance -= trans.amount;
                }
                if ( trans.receiver === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    getLatestBlock() {
        return this.chain[ this.chain.length - 1 ];
    }

    isChainValid() {
        for (let i = 1; i<this.chain.length; i++) {
            let currentBlock = this.chain[i];
            let previousBlock = this.chain[i-1];
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

let mycoin = new Blockchain();
mycoin.createTransaction(new Transaction('sender1', 'receiver1',   200));
mycoin.createTransaction(new Transaction('sender2', 'receiver2',   200));
mycoin.createTransaction(new Transaction('sender3', 'receiver3',   200));

console.log('Starting the miner...');
console.log('Balance of FMP address is: ', mycoin.getBalanceOfAddress('FMP'));
mycoin.minePendingTransactions('FMP');
console.log(JSON.stringify(mycoin, null, 4));

console.log('Restarting the miner...');
mycoin.minePendingTransactions('FMP');
console.log('Balance of FMP address is: ', mycoin.getBalanceOfAddress('FMP'));
console.log(JSON.stringify(mycoin, null, 4));
console.log('Balance of receiver3 address is: ', mycoin.getBalanceOfAddress('receiver3'));
console.log("Blockchain is valid: " + mycoin.isChainValid());
