const Tx = require('ethereumjs-tx').Transaction
const buffer = require('buffer')
const fs = require('fs')
const Common = require('ethereumjs-common').default
const FTM_MAIN = Common.forCustomChain(
  'mainnet', {
      name: 'fantom',
      networkId: 250, 
      chainId: 250
  }, 
  'petersburg'
)

const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 60,
  transactionPollingTimeout: 480
}

const fantom_rpc = 'https://rpcapi.fantom.network'
const gas_price = 20e10
const gas_limit = 300000
const confirmation_number = 1

const Rarity_contract_address = '0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb'
const Rarity_attribute_contract_address = '0xB5F5AF1087A8DA62A23b08C00C6ec9af21F397a1'
const Rarity_gold_contract_address = '0x2069B76Afe6b734Fb65D1d099E7ec64ee9CC76B2'
const Rarity_skills_contract_address = '0x6292f3fB422e393342f257857e744d43b1Ae7e70'
const Rarity_craft_contract_address = '0x2A0F1cB17680161cF255348dDFDeE94ea8Ca196A'

function sign_eth_tx(private_key, nonce, from_, data, contract_address)
{
  let rawTx = {
      nonce: nonce,
      gasLimit: '0x' + gas_limit.toString(16, 'hex'), 
      gasPrice: '0x' + gas_price.toString(16, 'hex'),    
      to: contract_address,
      from: from_,
      value: '0x00',
      data: data,
  }

  let tx = new Tx(rawTx, {common: FTM_MAIN})
  
  let privateKey_buf = Buffer.from(private_key, 'hex')
  tx.sign(privateKey_buf)
  
  return tx.serialize().toString('hex')
}

function add_pre_zero(num)
{
  let t = (num+'').length,
  s = '';
  for(let i=0; i<64-t; i++){
    s += '0';
  }
  return s+num;
}

function send_signed_transaction(web3, signed_tx) {
  try
	{
		var tran = web3.eth.sendSignedTransaction('0x' + signed_tx);
		console.log('transaction sent, wait for response.')
		tran.on('confirmation', (confirmationNumber, receipt) => {
			console.log('confirmation: ' + confirmationNumber);
      if (confirmationNumber >= confirmation_number) {
        process.exit(0)
      }
		});
		tran.on('transactionHash', hash => {
			console.log('hash:' + hash);
			
		});
		//tran.on('receipt', receipt => {
		//	console.log('receipt:' + receipt);
		//	return
		//});
		tran.on('error', (err)=>{
			console.log(err)
			process.exit(1)
		});
	} 
	catch (err)
	{
		console.log('Exception occured when waiting a response.')	
	}
}

async function sign_and_send_transaction(web3, private_key, data, contract_address) {

  let account = web3.eth.accounts.privateKeyToAccount(private_key)
  let from_ = account.address
  console.log('your account: ' + from_)
  
  let nonce = await web3.eth.getTransactionCount(from_)
  console.log('nonce: ' + nonce)

  let signed_tx = sign_eth_tx(private_key, nonce, from_, data, contract_address)
  send_signed_transaction(web3, signed_tx)
}

async function save_svg(b64, fn) {
  let data = Buffer.from(b64, 'base64').toString()
  let svg = JSON.parse(data).image.slice(JSON.parse(data).image.indexOf('base64,')+7)
  let binaryData = Buffer.from(svg, 'base64').toString('binary');
  fs.writeFile('svg/' + fn + ".svg", binaryData, "binary", function(err) {
    //console.log(err); 
  });
}

function read_from_file(fn) {
  let contents = fs.readFileSync(fn)

  return Buffer.from(contents, 'binary').toString().split('\n')
}

module.exports = {
  add_pre_zero,
  sign_and_send_transaction,
  save_svg,  
  read_from_file,

  options,
  fantom_rpc,
  confirmation_number,
  Rarity_contract_address,
  Rarity_attribute_contract_address,
  Rarity_gold_contract_address,
  Rarity_skills_contract_address,
  Rarity_craft_contract_address,
} 