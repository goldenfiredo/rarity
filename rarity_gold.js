const { ethers } = require("ethers")
const utils = require('./utils_new')

const provider = new ethers.providers.JsonRpcProvider(utils.fantom_rpc)
const rg_abi = require('./abi/rg_abi.json')
const abi = require('./abi/abi.json')
const contract = new ethers.Contract(utils.Rarity_gold_contract_address, rg_abi, provider)
const rarity_contract = new ethers.Contract(utils.Rarity_contract_address, abi, provider)
    
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
    let result = await contract.balanceOf(summoner_id)
    console.log('your summoner owns ' + result/1e18 + ' GOLD')
    result = await rarity_contract.summoner(summoner_id)
    let level = result._level
    result = await contract.claimed(summoner_id)
    let claimable = 0
    for (let i = result + 1; i <= level; i++) {
      claimable += wealth_by_level(i)  
    }
    if (claimable <= 0) {
      console.log('your summoner has no GOLD to claim')

      return
    } 
    
    console.log('- claim GOLD')
    let iface = new ethers.utils.Interface(rg_abi)
    let data = iface.encodeFunctionData('claim', [summoner_id]) 
    await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_gold_contract_address)

  } else {
    console.log('bad method name')
  }
}

function wealth_by_level(level) {
  let wealth = 0
  for (let i = 1; i < level; i++) {
    wealth += i * 1000e18
  }

  return wealth
}

main()