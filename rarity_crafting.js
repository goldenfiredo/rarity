const { ethers } = require("ethers")
const utils = require('./utils_new')
const rc2_utils = require('./rc2_utils')

const provider = new ethers.providers.JsonRpcProvider(utils.fantom_rpc)
const rc2_abi = require('./abi/rc2_abi.json')
const rc_abi = require('./abi/rc_abi.json')
const rarity_abi = require('./abi/abi.json')
const ra_abi = require('./abi/ra_abi.json')
const rg_abi = require('./abi/rg_abi.json')
const rs_abi = require('./abi/rs_abi.json')
const rarity_contract = new ethers.Contract(utils.Rarity_contract_address, rarity_abi, provider)
const rarity_attribute_contract = new ethers.Contract(utils.Rarity_attribute_contract_address, ra_abi, provider)
const rarity_craft_contract = new ethers.Contract(utils.Rarity_craft_contract_address, rc_abi, provider)
const rarity_gold_contract = new ethers.Contract(utils.Rarity_gold_contract_address, rg_abi, provider)
const rarity_skills_contract = new ethers.Contract(utils.Rarity_skills_contract_address, rs_abi, provider)

async function main() {
  
  if (process.argv.length < 4) {
    console.log('argv: private_key method arguments')
    console.log('\t method:')
    console.log('\t\t craft summoner_id')
    
    return
  }

  let private_key = process.argv[2]
  if (private_key.startsWith('0x')) private_key = private_key.slice(2)
  
  if (process.argv[3] == 'craft') {
    let summoner_id = parseInt(process.argv[4])
    console.log('\nsummoner id: ' + summoner_id)
    let result = await rarity_contract.summoner(summoner_id)
    let _class = parseInt(result._class)
    let level = parseInt(result._level)
    let xp = parseInt(result._xp)
    if (!rc2_utils.check_xp(xp)) {
      console.log('no enough xp')
      return
    }
    console.log('xp:', xp)

    result = await rarity_attribute_contract.ability_scores(summoner_id)
    let intelligence = parseInt(result.intelligence)
    if (intelligence == 0) {
      console.log('you need point_buy first')
      return
    }
    console.log('intelligence:', intelligence)

    result = await rarity_craft_contract.balanceOf(summoner_id)
    console.log('your summoner\'s attack bonus : ' + result + ' Craft')
    let craft = parseInt(result)
    craft = Math.floor(craft/10) * 10

    let skills = await rarity_skills_contract.get_skills(summoner_id)
    console.log(skills)
    let skill6 = parseInt(skills[5])

    result = match_type(skill6, intelligence, craft/10)
    let base_type = result[0]
    let item_type = result[1]
    console.log('base_type:', base_type)
    console.log('item_type:', item_type)
    if (base_type == 0) {
      console.log('crafting will lost, exit')
      return
    }

    result = await rarity_gold_contract.balanceOf(summoner_id)
    let gold = parseInt(result)
    console.log('your summoner\'s GOLD : ' + result + ' GOLD')
    
    if (!rc2_utils.check_gold(gold, base_type, item_type)) {
      console.log('no enough GOLD')
      return
    }

    if (!await check_approve(summoner_id)) {
      console.log('you need to approve')
      return
    }

    console.log('- craft')
    let iface = new ethers.utils.Interface(rc2_abi)
    let data = iface.encodeFunctionData('craft', [summoner_id, base_type, item_type, craft])

    await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_crafting_contract_address)

  } else {
    console.log('bad method name')
  }
}

function match_type(skill6, intelligence, craft) {
  let base_type = Math.floor(Math.random() * 3) + 1
  let item_type = 0
  let found = false
  let counter = 0
  while (!found && counter < 3) {
    
    if (base_type == 1) {
      for (item_type=1;item_type<=rc2_utils.goods_items;item_type++) {
        result = rc2_utils.craft_skillcheck(skill6, intelligence, base_type, item_type, craft)
        found = result >= 1
        break
      }
    }

    if (base_type == 2) {
      for (item_type=1;item_type<=rc2_utils.armor_items;item_type++) {
        result = rc2_utils.craft_skillcheck(skill6, intelligence, base_type, item_type, craft)
        found = result >= 1
        break
      }
    }

    if (base_type == 3) {
      for (item_type=1;item_type<=rc2_utils.weapon_items;item_type++) {
        result = rc2_utils.craft_skillcheck(skill6, intelligence, base_type, item_type, craft)
        found = result >= 1
        break
      }
    }

    if (!found) {
      base_type = (base_type + 1) % 3 + 1
    }

    counter++
  }

  if (!found) {
    return [0, 0]
  }

  return [base_type, item_type]
}

async function check_approve(summoner_id) {
  let result = await rarity_gold_contract.allowance(summoner_id, rc2_utils.SUMMMONER_ID)
  if (result == 0) return false
  result = await rarity_craft_contract.allowance(summoner_id, rc2_utils.SUMMMONER_ID)
  if (result == 0) return false
  result = await rarity_contract.getApproved(summoner_id)
  if (result != utils.Rarity_crafting_contract_address) return false

  return true
}
main()