const { ethers } = require("ethers")
const BigNumber = require('bignumber.js')

const utils = require('./utils_new')
const rc2_utils = require('./rc2_utils')

const provider = new ethers.providers.JsonRpcProvider(utils.fantom_rpc)

const rarity_abi = require('./abi/abi.json')
const rg_abi = require('./abi/rg_abi.json')
const rc_abi = require('./abi/rc_abi.json')

const rarity_contract = new ethers.Contract(utils.Rarity_contract_address, rarity_abi, provider)
const rarity_gold_contract = new ethers.Contract(utils.Rarity_gold_contract_address, rg_abi, provider)
const rarity_craft_contract = new ethers.Contract(utils.Rarity_craft_contract_address, rc_abi, provider)

async function main() {
  
  if (process.argv.length < 5) {
    console.log('argv: private_key summoner_id [0|1|2]')
  
    return
  }

  let private_key = process.argv[2]
  if (private_key.startsWith('0x')) private_key = private_key.slice(2)
  let summoner_id = parseInt(process.argv[3])
  console.log('summoner_id:', summoner_id)

  let iface = new ethers.utils.Interface(rg_abi)
  let data = iface.encodeFunctionData('approve', [summoner_id, rc2_utils.SUMMMONER_ID, ethers.BigNumber.from(ethers.constants.MaxUint256)])

  if (process.argv[4] == '0') {
    let result = await rarity_gold_contract.allowance(summoner_id, rc2_utils.SUMMMONER_ID)
    if (result.toString() == 0) { 
      console.log('approve to spend GOLD')
      await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_gold_contract_address)
    }
  }
  if (process.argv[4] == '1') {
    result = await rarity_craft_contract.allowance(summoner_id, rc2_utils.SUMMMONER_ID)
    if (result.toString() == 0) { 
      console.log('approve to spend Craft')
      await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_craft_contract_address)
    }
  }
  if (process.argv[4] == '2') {
    result = await rarity_contract.getApproved(summoner_id)
    if (result != utils.Rarity_crafting_contract_address) {
      console.log('approve Crafting contract')
      iface = new ethers.utils.Interface(rarity_abi)
      data = iface.encodeFunctionData('approve', [utils.Rarity_crafting_contract_address, summoner_id])
      console.log(data)
      
      await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_contract_address)
    }
  }
}

main()