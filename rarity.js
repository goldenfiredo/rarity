const Web3 = require('web3')
const utils = require('./utils')
const rc_utils = require('./rc_utils')

const web3 = new Web3(new Web3.providers.HttpProvider(utils.fantom_rpc), null, utils.options)
const abi = require('./abi/abi.json')
const ra_abi = require('./abi/ra_abi.json')
const rc_abi = require('./abi/rc_abi.json')
const contract = new web3.eth.Contract(abi, utils.Rarity_contract_address)
const rarity_attribute_contract = new web3.eth.Contract(ra_abi, utils.Rarity_attribute_contract_address)
const rarity_craft_contract = new web3.eth.Contract(rc_abi, utils.Rarity_craft_contract_address)

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
    if (isNaN(class_id) || class_id < 1 || class_id > 11) {
      console.log('bad class_id')
      return
    }

    let method_sig = web3.eth.abi.encodeFunctionSignature('summon(uint256)')
    await method1(private_key, class_id, method_sig, utils.Rarity_contract_address)

  } else if (process.argv[3] == 'adventure') {
    let summoner_id = parseInt(process.argv[4])
    console.log('\n* summoner id: ' + summoner_id)

    let result = await contract.methods.summoner(summoner_id).call()
    console.log(JSON.stringify(result))
    let next_adventure = result._log
    let xp = result._xp
    let level = result._level
    let _class = parseInt(result._class)
    result = await contract.methods.xp_required(level).call()
    if (parseInt(xp) >= parseInt(result)) {
      console.log('level up')
      let method_sig = web3.eth.abi.encodeFunctionSignature('level_up(uint256)')
      await method1(private_key, summoner_id, method_sig, utils.Rarity_contract_address)
      await wait(3000)
    }

    let start_date = new Date().getTime()
    console.log(new Date(start_date).toLocaleDateString() + ' ' + new Date(start_date).toLocaleTimeString())
    if (Math.floor(start_date / 1000) < next_adventure) {
      console.log('wait ' + (next_adventure - Math.floor(start_date / 1000)) + ' seconds for next adventure')
    } else {

      console.log('adventure')
      let method_sig = web3.eth.abi.encodeFunctionSignature('adventure(uint256)')
      await method1(private_key, summoner_id, method_sig, utils.Rarity_contract_address)
      await wait(5000)

      result = await contract.methods.tokenURI(summoner_id).call()
      let b64 = result.slice(result.indexOf('base64,')+7)
      await utils.save_svg(b64, summoner_id)

      result = await contract.methods.summoner(summoner_id).call()
      xp = result._xp
      level = result._level
      result = await contract.methods.xp_required(level).call()
      if (parseInt(xp) >= parseInt(result)) {
        console.log('level up')
        let method_sig = web3.eth.abi.encodeFunctionSignature('level_up(uint256)')
        await method1(private_key, summoner_id, method_sig, utils.Rarity_contract_address)
        await wait(3000)
      }
    }

    //craft
    result = await rarity_craft_contract.methods.balanceOf(summoner_id).call()
    console.log('\nyour summoner\'s attack bonus : ' + result + ' Craft')
    result = await rarity_attribute_contract.methods.ability_scores(summoner_id).call()
    let strength = parseInt(result.strength)
    let dexterity = parseInt(result.dexterity)
    let constitution = parseInt(result.constitution)
    if (strength == 0) {
      console.log('you need to create character first')
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
    
    result = await rarity_craft_contract.methods.adventurers_log(summoner_id).call()
    start_date = new Date().getTime()
    if (Math.floor(start_date / 1000) < result) {
      console.log('wait ' + (result - Math.floor(start_date / 1000)) + ' seconds for next attack')
      return
    }

    console.log('craft adventure')
    let method_sig = web3.eth.abi.encodeFunctionSignature('adventure(uint256)')
    await method1(private_key, summoner_id, method_sig, utils.Rarity_craft_contract_address)

  } else {
    console.log('bad method name')
  }
}

async function method1(private_key, int256_id, method_sig, contract_address) {

  let account = web3.eth.accounts.privateKeyToAccount(private_key)
  let from_ = account.address
  console.log('your account: ' + from_)
  
  let nonce = await web3.eth.getTransactionCount(from_)
  console.log('nonce: ' + nonce)

  let _id = utils.add_pre_zero(int256_id.toString(16, 'hex'))
  let data = method_sig + _id  

  let signed_tx = utils.sign_eth_tx(private_key, nonce, from_, data, contract_address)
  utils.send_signed_transaction(web3, signed_tx)
}

main()