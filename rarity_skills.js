const Web3 = require('web3')
const utils = require('./utils')
const rs_utils = require('./rs_utils')

const web3 = new Web3(new Web3.providers.HttpProvider(utils.fantom_rpc), null, utils.options)
const rs_abi = require('./rs_abi.json')
const rarity_abi = require('./abi.json')
const ra_abi = require('./ra_abi.json')
const contract = new web3.eth.Contract(rs_abi, utils.Rarity_skills_contract_address)
const rarity_contract = new web3.eth.Contract(rarity_abi, utils.Rarity_contract_address)
const rarity_attribute_contract = new web3.eth.Contract(ra_abi, utils.Rarity_attribute_contract_address)

async function main() {
  
  if (process.argv.length < 4) {
    console.log('argv: private_key method arguments')
    console.log('\t method:')
    console.log('\t\t set_skills summoner_id skills[36]')
    
    return
  }

  let private_key = process.argv[2]
  if (private_key.startsWith('0x')) private_key = private_key.slice(2)
  
  if (process.argv[3] == 'set_skills') {
    let summoner_id = parseInt(process.argv[4])
    console.log('\nsummoner id: ' + summoner_id)
    let result = await rarity_contract.methods.summoner(summoner_id).call()
    let _class = parseInt(result._class)
    let level = parseInt(result._level)
    
    result = await rarity_attribute_contract.methods.ability_scores(summoner_id).call()
    let intelligence = parseInt(result.intelligence)
    if (intelligence == 0) {
      console.log('you need point_buy first')
      return
    }
    
    let skill_points = rs_utils.skills_per_level(intelligence, _class, level)
    console.log('skill points:', skill_points)
    
    let cur_skills = rs_utils.to_int(await contract.methods.get_skills(summoner_id).call())
    console.log(cur_skills)
    let cur_spent_points = rs_utils.calculate_points_for_set(_class, cur_skills)
    
    let new_skills = rs_utils.get_available_skills(_class, level, skill_points, cur_skills)
    if (rs_utils.calculate_points_for_set(_class, new_skills) == cur_spent_points) {
      console.log('your summoner has been set higher skills, it is unnecessary to set skills now')
      return
    }
    
    console.log('set new skills')
    console.log(new_skills)
    let method_sig = web3.eth.abi.encodeFunctionSignature('set_skills(uint256,uint8[36])')
    await method1(private_key, summoner_id, new_skills, method_sig)

  } else {
    console.log('bad method name')
  }
}

async function method1(private_key, int256_id, new_skills, method_sig) {

  let account = web3.eth.accounts.privateKeyToAccount(private_key)
  let from_ = account.address
  console.log('your account: ' + from_)
  
  let nonce = await web3.eth.getTransactionCount(from_)
  console.log('nonce: ' + nonce)
  
  let data = method_sig + utils.add_pre_zero(int256_id.toString(16, 'hex')) 
  for (let i = 0; i < 36; i++) {
    data += utils.add_pre_zero(new_skills[i].toString(16, 'hex')) 
  }

  let signed_tx = utils.sign_eth_tx(private_key, nonce, from_, data, utils.Rarity_skills_contract_address)
  utils.send_signed_transaction(web3, signed_tx)
}

main()