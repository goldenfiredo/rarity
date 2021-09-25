const { ethers } = require("ethers")
const utils = require('./utils_new')
const rc_utils = require('./rc_utils')

const provider = new ethers.providers.JsonRpcProvider(utils.fantom_rpc)
const abi = require('./abi/abi.json')
const ra_abi = require('./abi/ra_abi.json')
const rc_abi = require('./abi/rc_abi.json')
const contract = new ethers.Contract(utils.Rarity_contract_address, abi, provider)
const rarity_attribute_contract = new ethers.Contract(utils.Rarity_attribute_contract_address, ra_abi, provider)
const rarity_craft_contract = new ethers.Contract(utils.Rarity_craft_contract_address, rc_abi, provider)

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

    console.log('- summon')
    let iface = new ethers.utils.Interface(abi)
    let data = iface.encodeFunctionData('summon', [class_id])
    await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_contract_address)

  } else if (process.argv[3] == 'adventure') {
    let summoner_id = parseInt(process.argv[4])
    console.log('\n* summoner id: ' + summoner_id)

    let result = await contract.summoner(summoner_id)
    let next_adventure = result._log
    let xp = parseInt(result._xp)
    let level = parseInt(result._level)
    let _class = parseInt(result._class)
    console.log('class:', _class)
    console.log('level:', level)
    console.log('xp:', xp/1e18)
    if (_class == 0) {
      console.log('call summoner error')
      return
    }
    result = await contract.xp_required(level)
    if (xp >= parseInt(result)) {
      console.log('- level up')
      let iface = new ethers.utils.Interface(abi)
      let data = iface.encodeFunctionData('level_up', [summoner_id])
      await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_contract_address)
    }

    await buy_point(private_key, summoner_id)
    
    let start_date = new Date().getTime()
    console.log(new Date(start_date).toLocaleDateString() + ' ' + new Date(start_date).toLocaleTimeString())
    if (Math.floor(start_date / 1000) < next_adventure) {
      console.log('wait ' + (next_adventure - Math.floor(start_date / 1000)) + ' seconds for next adventure')
    } else {

      console.log('- adventure')
      
      let iface = new ethers.utils.Interface(abi)
      let data = iface.encodeFunctionData('adventure', [summoner_id])

      await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_contract_address)

      result = await contract.tokenURI(summoner_id)
      let b64 = result.slice(result.indexOf('base64,')+7)
      await utils.save_svg(b64, summoner_id)

      result = await contract.summoner(summoner_id)
      xp = result._xp
      level = result._level
      result = await contract.xp_required(level)
      if (parseInt(xp) >= parseInt(result)) {
        console.log('- level up')
        let iface = new ethers.utils.Interface(abi)
        let data = iface.encodeFunctionData('level_up', [summoner_id])
        await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_contract_address)
      }
    }

    //craft adventure
    await craft_adventure(private_key, summoner_id, _class, level)
    
  } else {
    console.log('bad method name')
  }
}

async function buy_point(private_key, summoner_id) {
  let result = await rarity_attribute_contract.character_created(summoner_id)
  if (result == false) {
    let available_attributes = utils.read_from_file('ra_point_buy_inputs.txt')
    let attribute = available_attributes[Math.floor(Math.random() * available_attributes.length)].split(',')
    console.log('seleted attribute: ' + attribute)

    console.log('- buy point')
    let iface = new ethers.utils.Interface(ra_abi)
    let data = iface.encodeFunctionData('point_buy', [summoner_id, parseInt(attribute[0]), parseInt(attribute[1]), parseInt(attribute[2]), parseInt(attribute[3]), parseInt(attribute[4]), parseInt(attribute[5])])
    await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_attribute_contract_address)
  }
}

async function craft_adventure(private_key, summoner_id, _class, level) {
  let result = await rarity_craft_contract.balanceOf(summoner_id)
  console.log('\nyour summoner\'s attack bonus : ' + result + ' Craft')
  result = await rarity_attribute_contract.ability_scores(summoner_id)
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
  
  result = await rarity_craft_contract.adventurers_log(summoner_id)
  start_date = new Date().getTime()
  if (Math.floor(start_date / 1000) < result) {
    console.log('wait ' + (result - Math.floor(start_date / 1000)) + ' seconds for next attack')
    return
  }

  console.log('- craft adventure')
  let iface = new ethers.utils.Interface(rc_abi)
  let data = iface.encodeFunctionData('adventure', [summoner_id])
  await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_craft_contract_address)
}

main()