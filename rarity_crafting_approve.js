const Web3 = require('web3')
const utils = require('./utils')
const rc2_utils = require('./rc2_utils')

const web3 = new Web3(new Web3.providers.HttpProvider(utils.fantom_rpc), null, utils.options)
const rarity_abi = require('./abi/abi.json')
const rg_abi = require('./abi/rg_abi.json')
const rc_abi = require('./abi/rc_abi.json')
const rarity_contract = new web3.eth.Contract(rarity_abi, utils.Rarity_contract_address)
const rarity_gold_contract = new web3.eth.Contract(rg_abi, utils.Rarity_gold_contract_address)
const rarity_craft_contract = new web3.eth.Contract(rc_abi, utils.Rarity_craft_contract_address)

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
  
  if (process.argv.length < 5) {
    console.log('argv: private_key summoner_id [0|1|2]')
  
    return
  }

  let private_key = process.argv[2]
  if (private_key.startsWith('0x')) private_key = private_key.slice(2)
  let summoner_id = parseInt(process.argv[3])
  console.log('summoner_id:', summoner_id)

  let method_sig = web3.eth.abi.encodeFunctionSignature('approve(uint256,uint256,uint256)')
  let data = method_sig + utils.add_pre_zero(summoner_id.toString(16, 'hex'))
    + utils.add_pre_zero(rc2_utils.SUMMMONER_ID.toString(16, 'hex'))
    + 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' 
  if (process.argv[4] == '0') {
    let result = await rarity_gold_contract.methods.allowance(summoner_id, rc2_utils.SUMMMONER_ID).call()
    if (result == 0) { 
      console.log('approve to spend GOLD')
      await utils.sign_and_send_transaction(web3, private_key, data, utils.Rarity_gold_contract_address)
      await wait(5000)
    }
  }
  if (process.argv[4] == '1') {
    result = await rarity_craft_contract.methods.allowance(summoner_id, rc2_utils.SUMMMONER_ID).call()
    if (result == 0) { 
      console.log('approve to spend Craft')
      await utils.sign_and_send_transaction(web3, private_key, data, utils.Rarity_craft_contract_address)
      await wait(5000)
    }
  }
  if (process.argv[4] == '2') {
    result = await rarity_contract.methods.getApproved(summoner_id).call()
    if (result != utils.Rarity_crafting_contract_address) {
      console.log('approve Crafting contract')
      method_sig = web3.eth.abi.encodeFunctionSignature('approve(address,uint256)')
      data = method_sig + '000000000000000000000000' + utils.Rarity_crafting_contract_address.slice(2)
        + utils.add_pre_zero(summoner_id.toString(16, 'hex'))
      await utils.sign_and_send_transaction(web3, private_key, data, utils.Rarity_contract_address)
      await wait(5000)
    }
  }
}

main()