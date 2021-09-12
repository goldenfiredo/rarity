const Web3 = require('web3')
const utils = require('./utils')
const rc_utils = require('./rc_utils')

const web3 = new Web3(new Web3.providers.HttpProvider(utils.fantom_rpc), null, utils.options)
const rc_abi = require('./abi/rc_abi.json')
const rarity_abi = require('./abi/abi.json')
const ra_abi = require('./abi/ra_abi.json')
const contract = new web3.eth.Contract(rc_abi, utils.Rarity_craft_contract_address)
const rarity_contract = new web3.eth.Contract(rarity_abi, utils.Rarity_contract_address)
const rarity_attribute_contract = new web3.eth.Contract(ra_abi, utils.Rarity_attribute_contract_address)

async function main() {
  
  if (process.argv.length < 4) {
    console.log('argv: private_key method arguments')
    console.log('\t method:')
    console.log('\t\t adventure summoner_id')
    
    return
  }

  let private_key = process.argv[2]
  if (private_key.startsWith('0x')) private_key = private_key.slice(2)
  
  if (process.argv[3] == 'adventure') {
    let summoner_id = parseInt(process.argv[4])
    console.log('\nsummoner id: ' + summoner_id)
    let result = await rarity_contract.methods.summoner(summoner_id).call()
    let _class = parseInt(result._class)
    let level = parseInt(result._level)
    
    result = await contract.methods.balanceOf(summoner_id).call()
    console.log('your summoner\'s attack bonus : ' + result + ' Craft')

    result = await rarity_attribute_contract.methods.ability_scores(summoner_id).call()
    let strength = parseInt(result.strength)
    let dexterity = parseInt(result.dexterity)
    let constitution = parseInt(result.constitution)
    if (strength == 0) {
      console.log('you need point_buy first')
      return
    }

    console.log('health:',rc_utils.health_by_class_and_level(_class, level, constitution))
    console.log('damage:',rc_utils.damage(strength))
    console.log('armor class:',rc_utils.armor_class(dexterity))
    console.log('attack bonus:',rc_utils.attack_bonus(_class, strength, level))

    let rewards = rc_utils.scout(_class, level, strength, dexterity, constitution)
    console.log('rewards:', rewards)
    if (rewards <= 0) {
      console.log('rewards for attacking is 0, don\'t attack dungeon')
      return 
    }
    
    result = await contract.methods.adventurers_log(summoner_id).call()
    let start_date = new Date().getTime()
    console.log(new Date(start_date).toLocaleDateString() + ' ' + new Date(start_date).toLocaleTimeString())
    if (Math.floor(start_date / 1000) < result) {
      console.log('wait ' + (result - Math.floor(start_date / 1000)) + ' seconds for next attack')
      return
    }

    console.log('- craft adventure')
    let method_sig = web3.eth.abi.encodeFunctionSignature('adventure(uint256)')
    let data = method_sig + utils.add_pre_zero(summoner_id.toString(16, 'hex'))
    await utils.sign_and_send_transaction(web3, private_key, data, utils.Rarity_craft_contract_address)

  } else {
    console.log('bad method name')
  }
}

main()