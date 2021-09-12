const Web3 = require('web3')
const utils = require('./utils')

const web3 = new Web3(new Web3.providers.HttpProvider(utils.fantom_rpc), null, utils.options)
const abi = require('./abi/rg_abi.json')
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
    
    console.log('- claim GOLD')
    let method_sig = web3.eth.abi.encodeFunctionSignature('claim(uint256)')
    let data = method_sig + utils.add_pre_zero(summoner_id.toString(16, 'hex'))
    await utils.sign_and_send_transaction(web3, private_key, data, utils.Rarity_gold_contract_address)

  } else {
    console.log('bad method name')
  }
}

main()