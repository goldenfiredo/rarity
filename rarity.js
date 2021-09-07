const Tx = require('ethereumjs-tx').Transaction
const buffer = require('buffer')
const Web3 = require('web3')
const fs = require('fs')

const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 60,
  transactionPollingTimeout: 480
};

const web3 = new Web3(new Web3.providers.HttpProvider("https://rpcapi.fantom.network"), null, options)
const Rarity_contract_address = '0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb'
const abi = require('./abi.json')
const contract = new web3.eth.Contract(abi, Rarity_contract_address)

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
    
async function main() {
  
  if (process.argv.length < 4) {
    console.log('argv: private_key method arguments')
    console.log('\t method:')
    console.log('\t\t summon class_id[1-11]')
    console.log('\t\t adventure summoner_id')

    return
  }

  let private_key = process.argv[2]
  if (private_key.startsWith('0x')) private_key = private_key.slice(2)
  
  if (process.argv[3] == 'summon') {
    let class_id = parseInt(process.argv[4])
    if (class_id < 0 || class_id > 11) {
      console.log('bad class_id')
      return
    }

    let method_sig = web3.eth.abi.encodeFunctionSignature('summon(uint256)')
    await method1(private_key, class_id, method_sig)

  } else if (process.argv[3] == 'adventure') {
    let summoner_id = parseInt(process.argv[4])
    console.log('\nsummoner id:' + summoner_id)

    let result = await contract.methods.summoner(summoner_id).call()
    console.log(JSON.stringify(result))
    let next_adventure = result._log
    let cur_xp = result._xp
    let cur_level = result._level

    result = await contract.methods.xp_required(cur_level).call()
    if (cur_xp >= result.xp_to_next_level) {
      let method_sig = web3.eth.abi.encodeFunctionSignature('level_up(uint256)')
      await method1(private_key, summoner_id, method_sig)
      await wait(3000)
    }

    let start_date = new Date().getTime()
    console.log(new Date(start_date).toLocaleDateString() + ' ' + new Date(start_date).toLocaleTimeString())
    if (Math.floor(start_date / 1000) < next_adventure) {
      console.log('wait for ' + (next_adventure - Math.floor(start_date / 1000)) + ' seconds to adventure again')
      return
    }

    let method_sig = web3.eth.abi.encodeFunctionSignature('adventure(uint256)')
    await method1(private_key, summoner_id, method_sig)
    await wait(5000)

    result = await contract.methods.tokenURI(summoner_id).call()
    let b64 = result.slice(result.indexOf('base64,')+7)
    await save_png(b64, summoner_id)

  } else {
    console.log('bad method name')
  }
}

async function save_png(b64, _id) {
    let data = Buffer.from(b64, 'base64').toString()
    let svg = JSON.parse(data).image.slice(JSON.parse(data).image.indexOf('base64,')+7)
    let binaryData = Buffer.from(svg, 'base64').toString('binary');
    fs.writeFile('svg/' + _id + ".svg", binaryData, "binary", function(err) {
      //console.log(err); 
    });
}

async function method1(private_key, int256_id, method_sig) {

  let gas_price = 6e10
  let account = web3.eth.accounts.privateKeyToAccount(private_key)
  let from_ = account.address
  console.log('from:' + from_)
  
  let nonce = await web3.eth.getTransactionCount(from_)
  console.log('nonce:' + nonce)
  
  let gas_limit = 210000

  let signed_tx = sign_eth_tx(private_key, nonce, gas_limit, gas_price, from_, int256_id, method_sig)
  
  try
	{
		var tran = web3.eth.sendSignedTransaction('0x' + signed_tx);
		console.log('transaction sent, wait for response.')
		tran.on('confirmation', (confirmationNumber, receipt) => {
			console.log('confirmation: ' + confirmationNumber);
      if (confirmationNumber >= 2) {
        process.exit(0)
      }
		});
		tran.on('transactionHash', hash => {
			console.log('hash:' + hash);
			
		});
		tran.on('receipt', receipt => {
			console.log('receipt:' + receipt);
			return
		});
		tran.on('error', (err)=>{
			console.log(err);  
			//return
		});
	} 
	catch (err)
	{
		console.log('Exception occured when waiting a response.')	
	}

}


function sign_eth_tx(private_key, nonce, gas_limit, gas_price, from_, int256_id, method_sig)
{
  let _id = add_pre_zero(int256_id.toString(16, 'hex'))
  let data = method_sig + _id  

  let rawTx = {
      nonce: nonce,
      gasLimit: '0x' + gas_limit.toString(16, 'hex'), 
      gasPrice: '0x' + gas_price.toString(16, 'hex'),    
      to: Rarity_contract_address,
      from: from_,
      value: '0x00',
      data: data,
  }

  var tx = new Tx(rawTx, {'chain': 'ftm'});
  
  var privateKey_buf = Buffer.from(private_key, 'hex');
  tx.sign(privateKey_buf);
  
  var serializedTx = tx.serialize().toString('hex');
  console.log(serializedTx)

  return serializedTx
}

function add_pre_zero(num)
{
  var t = (num+'').length,
  s = '';
  for(var i=0; i<64-t; i++){
    s += '0';
  }
  return s+num;
} 

main()