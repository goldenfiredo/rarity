const Web3 = require('web3')
const utils = require('./utils')

const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 60,
  transactionPollingTimeout: 480
};

const web3 = new Web3(new Web3.providers.HttpProvider(utils.fantom_rpc), null, options)
const abi = require('./rg_abi.json')
const contract = new web3.eth.Contract(abi, utils.Rarity_gold_contract_address)
    
async function main() {
  
  if (process.argv.length < 4) {
    console.log('argv: private_key method arguments')
    console.log('\t method:')
    console.log('\t\t claim summoner_id')
    
    return
  }

  let private_key = process.argv[2]
  if (private_key.startsWith('0x')) private_key = private_key.slice(2)
  
  if (process.argv[3] == 'claim') {
    let summoner_id = parseInt(process.argv[4])
    console.log('\nsummoner id: ' + summoner_id)
    let result = await contract.methods.balanceOf(summoner_id).call()
    console.log('your summoner owns ' + result/1e18 + ' GOLD')
    result = await contract.methods.claimable(summoner_id).call()
    if (result <= 0) {
      console.log('your summoner has no GOLD to claim')

      return
    } 
    
    console.log('claim')
    let method_sig = web3.eth.abi.encodeFunctionSignature('claim(uint256)')
    await method1(private_key, summoner_id, method_sig)

  } else {
    console.log('bad method name')
  }
}

async function method1(private_key, int256_id, method_sig) {

  let account = web3.eth.accounts.privateKeyToAccount(private_key)
  let from_ = account.address
  console.log('your account: ' + from_)
  
  let nonce = await web3.eth.getTransactionCount(from_)
  console.log('nonce: ' + nonce)
  
  let data = method_sig + utils.add_pre_zero(int256_id.toString(16, 'hex')) 

  let signed_tx = utils.sign_eth_tx(private_key, nonce, from_, data, utils.Rarity_gold_contract_address)
  utils.send_signed_transaction(web3, signed_tx)
}

main()